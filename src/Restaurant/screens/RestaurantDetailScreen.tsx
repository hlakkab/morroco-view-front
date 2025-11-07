import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken
} from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../translations/i18n';

import AboutSection from '../../components/AboutSection';
import Button from '../../components/Button';
import ButtonFixe from '../../components/ButtonFixe';
import LocationSection from '../../components/LocationSection';
import ScreenHeader from '../../components/ScreenHeader';
import AuthModal from '../../components/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import HeaderContainer from '../../containers/HeaderContainer';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleRestaurantBookmark } from '../store/restaurantSlice';
import { RootStackParamList } from '../../types/navigation';
import { Restaurant } from '../types/Restaurant';
import { useImages } from '../../utils/useImages';

const { width, height } = Dimensions.get('window');

const TOUR_FLAG = '@restaurantDetailTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const RestaurantDetailScreenContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);

  // Get restaurant code directly for image fetching (same pattern as Monument, Entertainment, and Artisan)
  const restaurantCode = selectedRestaurant?.code;
  
  // Use hook to fetch all images (batch fetch) - pass large number to fetch all available
  const { images: fetchedImages, loading: loadingImages } = useImages(
    restaurantCode,
    undefined, // Don't use existing images - fetch fresh
    100 // Large number to fetch all available images
  );

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

    if (hasSeenTour === false && !tourStarted && !visible && selectedRestaurant) {
      
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible, selectedRestaurant]);

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    if (selectedRestaurant) {
      dispatch(toggleRestaurantBookmark(selectedRestaurant));
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50, // Détecte quand une image est visible à 50% ou plus
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      // @ts-ignore
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

  const handleReservation = () => {
    
    // Implémentez la logique de réservation ici
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={selectedRestaurant!.name} 
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>
        
      <ScrollView style={styles.scrollView}>
        <CopilotStep
          text={i18n.t('copilot.viewRestaurantImages')}
          order={1}
          name="gallery"
        >
          <WalkthroughableView style={styles.galleryHighlight}>
            <View style={styles.imageContainer}>
              <View style={styles.imageSection}>
                {loadingImages && (!fetchedImages || fetchedImages.length === 0) ? (
                  <View style={styles.imageLoadingContainer}>
                    <ActivityIndicator size="large" color="#008060" />
                    <Text style={styles.loadingText}>{i18n.t('restaurants.loadingImages') || 'Loading images...'}</Text>
                  </View>
                ) : (
                  <>
                    <FlatList
                      data={
                        fetchedImages && fetchedImages.length > 0
                          ? fetchedImages
                          : selectedRestaurant!.images || []
                      }
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={handleScroll}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={({ item }) => (
                        <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
                      )}
                    />

                    <TouchableOpacity style={[styles.saveButton, selectedRestaurant!.saved && styles.savedButton]} onPress={handleSave}>
                      <Ionicons
                        name={selectedRestaurant!.saved ? 'bookmark' : 'bookmark-outline'}
                        size={24}
                        color={selectedRestaurant!.saved ? '#fff' : '#000'}
                      />
                    </TouchableOpacity>

                    <View style={styles.paginationContainer}>
                      <View style={styles.pagination}>
                        {(fetchedImages && fetchedImages.length > 0 ? fetchedImages : selectedRestaurant!.images || []).map((_, index) => (
                          <View
                            key={index}
                            style={[styles.paginationDot, index === currentImageIndex && styles.activePaginationDot]}
                          />
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <View style={styles.content}>
          <CopilotStep
            text={i18n.t('copilot.checkRestaurantHours')}
            order={2}
            name="operatingHours"
          >
            <WalkthroughableView style={styles.operatingHoursHighlight}>
              <View style={styles.operatingHoursContainer}>
                <Ionicons name="time-outline" size={16} color="#137A08" />
                <Text style={styles.operatingHoursText}>
                  {i18n.t('restaurants.operatingHours')} {selectedRestaurant!.endTime}    
                </Text>
              </View>
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.learnAboutRestaurant')}
            order={3}
            name="about"
          >
            <WalkthroughableView style={styles.aboutHighlight}>
              <AboutSection
                title={i18n.t('restaurants.about')}
                text={selectedRestaurant!.description || i18n.t('restaurants.noInformation')}
              />
            </WalkthroughableView>
          </CopilotStep>

          <CopilotStep
            text={i18n.t('copilot.findRestaurantLocation')}
            order={4}
            name="location"
          >
            <WalkthroughableView style={styles.locationHighlight}>
              <LocationSection
                title={i18n.t('restaurants.location')}
                address={selectedRestaurant!.address || ""}
                mapUrl={`https://maps.app.goo.gl/${selectedRestaurant!.mapId}`}
              />
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </ScrollView>

      {/* <CopilotStep
        text={i18n.t('copilot.bookRestaurantTable')}
        order={5}
        name="reservation"
      >
        <WalkthroughableView style={styles.reservationHighlight}>
          <ButtonFixe title={i18n.t('restaurants.bookReservation')} onPress={handleReservation} />
        </WalkthroughableView>
      </CopilotStep> */}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const RestaurantDetailScreen: React.FC = () => {
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
      <RestaurantDetailScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    width: width,
    height: 240,
    backgroundColor: '#FFF7F7',
    overflow: 'hidden', // Pour s'assurer qu'aucun contenu ne déborde
  },
  image: {
    width: width,
    height: 240,
  },
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
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  savedButton: {
    backgroundColor: '#666',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingBlockEnd: '10%',
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
  },
  operatingHoursContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: 2,
    borderRadius: 30,
    backgroundColor: '#F0FFFA',
    padding: 10,
  },
  operatingHoursText: {
    fontFamily: 'Raleway',
    marginLeft: 8,
    fontSize: 13,
    color: '#137A08',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF7F7',
  },
  imageContainer: {
    marginBottom: 8,
    backgroundColor: '#F6FAFF',
    width: 370,
    height: 234,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 20,
  },
  bottomContainer: {
    marginTop: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: 415,
    height: 90,
    alignItems: 'center',
    alignSelf: 'center',
   backgroundColor: '#FFF7F7',
  },
  reservationButton: {
    marginTop: 12,
    width: 340,
    height: 53,
    borderRadius: 32,
    backgroundColor: '#AE1913',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 20px 0px #AE191366',
  },
  reservationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  operatingHoursHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  aboutHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  locationHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  reservationHighlight: {
    width: '100%',
    overflow: 'hidden',
  },
  imageLoadingContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
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
  }
});

export default RestaurantDetailScreen;
