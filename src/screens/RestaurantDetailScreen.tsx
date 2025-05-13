import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState, useEffect } from 'react';
import {
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
import i18n from '../translations/i18n';

import AboutSection from '../components/AboutSection';
import Button from '../components/Button';
import ButtonFixe from '../components/ButtonFixe';
import LocationSection from '../components/LocationSection';
import ScreenHeader from '../components/ScreenHeader';
import HeaderContainer from '../containers/HeaderContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleRestaurantBookmark } from '../store/restaurantSlice';
import { RootStackParamList } from '../types/navigation';
import { Restaurant } from '../types/Restaurant';

const { width, height } = Dimensions.get('window');

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const RestaurantDetailScreenContent: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const { selectedRestaurant } = useAppSelector((state) => state.restaurant);

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted && selectedRestaurant) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted, selectedRestaurant]);

  // Handle Copilot events
  useEffect(() => {
    const handleStop = () => {
      console.log('Tour completed or stopped');
    };
    
    copilotEvents.on('stop', handleStop);
    
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
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
    console.log('Book a Reservation');
    // Implémentez la logique de réservation ici
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>Tour Guide</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <ScreenHeader title={selectedRestaurant!.name} />
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
                <FlatList
                  data={selectedRestaurant!.images}
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
                    {selectedRestaurant!.images?.map((_, index) => (
                      <View
                        key={index}
                        style={[styles.paginationDot, index === currentImageIndex && styles.activePaginationDot]}
                      />
                    ))}
                  </View>
                </View>
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

      <CopilotStep
        text={i18n.t('copilot.bookRestaurantTable')}
        order={5}
        name="reservation"
      >
        <WalkthroughableView style={styles.reservationHighlight}>
          <ButtonFixe title={i18n.t('restaurants.bookReservation')} onPress={handleReservation} />
        </WalkthroughableView>
      </CopilotStep>
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
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#008060',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default RestaurantDetailScreen;
