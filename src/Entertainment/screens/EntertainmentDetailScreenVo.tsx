import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../translations/i18n';

import AboutSection from '../../components/AboutSection';
import ButtonFixe from '../../components/ButtonFixe';
import LocationSection from '../../components/LocationSection';
import SaveButton from '../../components/SaveButtonPrf';
import ScreenHeader from '../../components/ScreenHeader';
import AuthModal from '../../components/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { toggleEntertainmentBookmark } from '../store/entertainmentSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Entertainment, entertainmentHelpers } from '../types/Entertainment';
import { RootStackParamList } from '../../types/navigation';
import { useImages } from '../../utils/useImages';
import EntertainmentReservationPopup from '../components/EntertainmentReservationPopup';

const { width } = Dimensions.get('window');

const TOUR_FLAG = '@entertainmentDetailTourSeen';

// Type pour les paramètres de route
type EntertainmentDetailRouteProp = RouteProp<RootStackParamList, 'EntertainmentDetail'>;

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const EntertainmentDetailScreenContent: React.FC = () => {
  const route = useRoute<EntertainmentDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const { productCode, title } = route.params;

  // Get selected entertainment from Redux state
  const selectedEntertainment = useAppSelector(state => state.entertainment.selectedEntertainment);

  // Initialisation des états
  const [entertainment, setEntertainment] = useState<Entertainment | null>(selectedEntertainment);
  const [loading, setLoading] = useState<boolean>(!selectedEntertainment);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReservationPopup, setShowReservationPopup] = useState(false);

  // Get entertainment code directly for image fetching (same pattern as Monument)
  const entertainmentCode = entertainment?.code || productCode;
  
  // Use hook to fetch all images (batch fetch) - pass large number to fetch all available
  const { images: fetchedImages, loading: loadingImages } = useImages(
    entertainmentCode,
    undefined, // Don't use existing images - fetch fresh
    100 // Large number to fetch all available images
  );

  useEffect(() => {
    const fetchDetail = async () => {
      // If we already have the selected entertainment, use it
      if (selectedEntertainment) {
        setEntertainment(selectedEntertainment);
        setLoading(false);
        return;
      }

      if (!productCode) {
        setError('No product code provided');
        setLoading(false);
        return;
      }

      try { 
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching entertainment details:', err);
        setError(err.message || 'Error fetching product detail');
        setLoading(false);
      }
    };

    fetchDetail();
  }, [productCode, title, selectedEntertainment]);

  // ─── 1.  ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. ──────────
  useEffect(() => {
    

    if (hasSeenTour === false && !loading && !tourStarted && !visible && entertainment) {
      
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, loading, startTour, tourStarted, visible, entertainment]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader 
          title={title || 'Loading...'} 
          showTour={!visible}
          onTourPress={handleStartTour}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>{i18n.t('entertainment.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !entertainment) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader 
          title={title || 'Error'} 
          showTour={!visible}
          onTourPress={handleStartTour}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="red" />
          <Text style={styles.errorText}>{error || i18n.t('entertainment.noInformation')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calcul du rating - support both new and legacy formats
  const { rating, ratingCount } = entertainmentHelpers.getRatingInfo(entertainment);

  // Log the whole entertainment response
  console.log('Entertainment Full Response:', JSON.stringify(entertainment, null, 2));
  console.log('Entertainment isPartner:', entertainment.isPartner);

  // Use fetched images from hook, or fallback to existing images, or placeholder
  const images: string[] = (() => {
    // Use fetched images from hook if available
    if (fetchedImages && fetchedImages.length > 0) {
      return fetchedImages;
    }

    // Fallback to existing images from entertainment object
    if (entertainment.images && entertainment.images.length > 0) {
      // Check if new API format (array of strings)
      if (typeof entertainment.images[0] === 'string') {
        return entertainment.images as string[];
      }

      // Legacy format (array of image objects with variants)
      const legacyUrls = entertainment.images
        .map((img: any) => {
          if (!img.variants || img.variants.length === 0) return '';
          const sortedVariants = [...img.variants].sort((a: any, b: any) => 
            (b.width * b.height) - (a.width * a.height)
          );
          const idealVariant = sortedVariants.find((v: any) => 
            v.width >= 720 && v.width <= 1080
          ) || sortedVariants[0];
          return idealVariant?.url || '';
        })
        .filter((url: string) => url !== '');
      
      if (legacyUrls.length > 0) {
        return legacyUrls;
      }
    }

    // Fallback to placeholder if no images
    return ['https://via.placeholder.com/300'];
  })();

  // Calcul de la durée (si renseignée dans l'itinéraire)
  let durationText = '';
  if (entertainment.itinerary && entertainment.itinerary.duration) {
    const minutes = entertainment.itinerary.duration.fixedDurationInMinutes ||
      entertainment.itinerary.duration.variableDurationFromMinutes;
    if (minutes) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (hours > 0 && remainingMinutes > 0) {
        durationText = `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`;
      } else if (hours > 0) {
        durationText = `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        durationText = `${minutes} minutes`;
      }
    }
  }

  const pickupOffered = entertainment.logistics?.travelerPickup?.allowCustomTravelerPickup ? 'Pickup offered' : '';
  const ticketType = entertainment.ticketInfo?.ticketTypes?.includes('MOBILE_ONLY') ? 'Mobile Ticket' : '';

  let guideLabel = '';
  if (entertainment.languageGuides && entertainment.languageGuides.length > 0) {
    const guideLangs = entertainment.languageGuides.filter(g => g.type === 'GUIDE');
    if (guideLangs.length > 0) {
      const primaryGuide = guideLangs.find(g => g.language === 'en') || guideLangs[0];
      const extraCount = guideLangs.length - 1;
      guideLabel = `In-person Guide\nIn ${primaryGuide.language === 'en' ? 'English' : primaryGuide.language}${extraCount > 0 ? ` & ${extraCount} more` : ''}`;
    }
  }

  // Fonction pour afficher les étoiles de rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <View style={styles.starContainer}>
        {Array.from({ length: fullStars }).map((_, index) => (
          <FontAwesome key={`full-${index}`} name="star" size={20} color="#FFD700" />
        ))}
        {hasHalfStar && <FontAwesome name="star-half-empty" size={20} color="#FFD700" />}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  const handleSave = async () => {
    if (!(await isAuthenticated())) {
      setShowAuthModal(true);
      return;
    }
    
    if (entertainment) {
      dispatch(toggleEntertainmentBookmark(entertainment));
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  const handleBook = () => {
    if (!entertainment) return;
    setShowReservationPopup(true);
  };

  // Get display name
  const displayName = entertainmentHelpers.getDisplayName(entertainment);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={displayName} 
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        <CopilotStep
          text={i18n.t('copilot.viewEntertainmentImages')}
          order={1}
          name="images"
        >
          <WalkthroughableView style={styles.imageSection}>
            {loadingImages && images.length === 0 ? (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#008060" />
                <Text style={styles.loadingText}>{i18n.t('entertainment.loadingImages') || 'Loading images...'}</Text>
              </View>
            ) : (
              <>
                <FlatList
                  ref={flatListRef}
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
                  )}
                />
                <SaveButton onPress={handleSave} isSaved={entertainment.saved} />
                {images.length > 1 && (
                  <View style={styles.paginationContainer}>
                    <View style={styles.pagination}>
                      {images.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.paginationDot,
                            currentImageIndex === index && styles.activePaginationDot
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </WalkthroughableView>
        </CopilotStep>

        <View style={styles.content}>
          <CopilotStep
            text={i18n.t('copilot.viewEntertainmentInfo')}
            order={2}
            name="ratingsAndSpecs"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <View style={styles.ratingContainer}>
                {renderStars(rating)}
                <Text style={styles.reviewsText}>({ratingCount} {ratingCount === 1 ? i18n.t('entertainment.review') : i18n.t('entertainment.reviews')})</Text>
              </View>

              <Text style={styles.sectionTitle}>{i18n.t('transport.specifications')}</Text>
              <View style={styles.specificationsContainer}>
                {/* Operating Hours - New API */}
                {entertainment.startTime && entertainment.endTime && (
                  <View style={styles.specItem}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.specText}>
                      {i18n.t('entertainment.operatingHours') || 'Operating Hours'}: {entertainment.startTime} - {entertainment.endTime}
                    </Text>
                  </View>
                )}
                
                {/* Duration - Legacy API */}
                {durationText !== '' && (
                  <View style={styles.specItem}>
                    <Ionicons name="hourglass-outline" size={20} color="#666" />
                    <Text style={styles.specText}>{durationText}</Text>
                  </View>
                )}

                {/* Booking Required - New API */}
                {entertainment.bookingRequired && (
                  <View style={styles.specItem}>
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text style={styles.specText}>
                      {entertainment.bookingRequired === 'YES' ? 'Booking Required' : 
                       entertainment.bookingRequired === 'RECOMMENDED' ? 'Booking Recommended' : 
                       'No Booking Required'}
                    </Text>
                  </View>
                )}

                {/* Age Restriction - New API */}
                {entertainment.ageRestriction && (
                  <View style={styles.specItem}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <Text style={styles.specText}>Age {entertainment.ageRestriction}+</Text>
                  </View>
                )}

                {/* Contact Info - New API */}
                {entertainment.phoneNumber && (
                  <View style={styles.specItem}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                    <Text style={styles.specText}>{entertainment.phoneNumber}</Text>
                  </View>
                )}

                {pickupOffered !== '' && (
                  <View style={styles.specItem}>
                    <Ionicons name="car-outline" size={20} color="#666" />
                    <Text style={styles.specText}>{pickupOffered}</Text>
                  </View>
                )}
                {ticketType !== '' && (
                  <View style={styles.specItem}>
                    <Ionicons name="ticket-outline" size={20} color="#666" />
                    <Text style={styles.specText}>{ticketType}</Text>
                  </View>
                )}
                {guideLabel !== '' && (
                  <View style={styles.specItem}>
                    <Ionicons name="person-outline" size={20} color="#666" />
                    <Text style={styles.specText}>{guideLabel}</Text>
                  </View>
                )}
              </View>

              {/* Pricing Section - New API with multiple pricing options */}
              {entertainment.pricings && entertainment.pricings.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>{i18n.t('entertainment.pricing') || 'Pricing'}</Text>
                  <View style={styles.pricingContainer}>
                    {entertainment.pricings.map((pricing) => (
                      <View key={pricing.id} style={styles.pricingItem}>
                        <View style={styles.pricingInfo}>
                          <Text style={styles.pricingCategory}>
                            {pricing.category.charAt(0) + pricing.category.slice(1).toLowerCase()}
                          </Text>
                          <Text style={styles.pricingDuration}>
                            {pricing.duration} min • {pricing.unitLabel}
                          </Text>
                        </View>
                        <Text style={styles.pricingPrice}>{pricing.price.toFixed(2)} MAD</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.readEntertainmentDetails')}
            order={3}
            name="about"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <AboutSection 
                text={entertainmentHelpers.cleanDescription(entertainment.description || i18n.t('entertainment.noInformation'))} 
                title={i18n.t('entertainment.about')} 
              />
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.findEntertainmentLocation')}
            order={4}
            name="location"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <LocationSection 
                address={entertainment.address || entertainment.location || ''} 
                mapUrl={entertainment.mapUrl} 
                title={i18n.t('entertainment.location')} 
              />
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </ScrollView>

      {entertainment.pricings && entertainment.pricings.length > 0 && (
        <CopilotStep
          text={i18n.t('copilot.bookEntertainment')}
          order={5}
          name="bookButton"
        >
          <WalkthroughableView style={styles.walkthroughContainer}>
            <ButtonFixe title={i18n.t('entertainment.bookReservation')} onPress={handleBook} />
          </WalkthroughableView>
        </CopilotStep>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {entertainment && (
        <EntertainmentReservationPopup
          visible={showReservationPopup}
          onClose={() => setShowReservationPopup(false)}
          entertainment={entertainment}
        />
      )}
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const EntertainmentDetailScreenVo: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('copilot.navigation.skip'),
        previous: i18n.t('copilot.navigation.previous'),
        next: i18n.t('copilot.navigation.next'),
        finish: i18n.t('copilot.navigation.finish')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
    >
      <EntertainmentDetailScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  imageLoadingContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
  },
  imageSection: {
    /* position: 'relative',
     width: 370,
     alignSelf: 'center',
     alignItems: 'center',
     height: 240,
     backgroundColor: '#FFF7F7',
     padding: 1,
     borderRadius: 32,
     marginTop: 10,*/
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#FFF7F7',
  },
  image: {
    /*width: 368.1,
    height: 240,
    borderRadius: 32,
    alignSelf: 'center',
    marginRight:0.1*/
    width: width,
    height: 240,
  },
  /*
  paginationContainer: {
     position: 'absolute',
      bottom: 10,
      flexDirection: 'row',
      justifyContent: 'center',
  },
  paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
      marginHorizontal: 4,
  },*/
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#fff',
  },


  content: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  reviewsText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 0,
    color: '#000'
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 6,
    marginBottom: 6
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8
  },
  specText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666'
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20
  },
  tooltip: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#CE1126',
    width: '85%',
  },
  walkthroughContainer: {
    width: '100%',
  },
  pricingContainer: {
    marginBottom: 16,
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F6FAFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  pricingInfo: {
    flex: 1,
  },
  pricingCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pricingDuration: {
    fontSize: 13,
    color: '#666',
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#006400',
  },
});

export default EntertainmentDetailScreenVo;