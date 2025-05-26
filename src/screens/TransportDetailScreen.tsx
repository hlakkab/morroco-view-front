import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import ReservationPopup from '../containers/ReservationPopup';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearPickupDetails, fetchPickupDetails, toggleSavedStatus } from '../store/hotelPickupDetailsSlice';
import i18n from '../translations/i18n';

const TOUR_FLAG = '@transportDetailTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface RouteParams {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
  isPrivate: boolean;
}

const { width, height } = Dimensions.get('window');

const TransportDetailScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, title, price } = route.params as RouteParams;
  const dispatch = useAppDispatch();
  const { currentPickup, loading, error } = useAppSelector((state) => state.hotelPickupDetails);
  const { currentLanguage } = useLanguage();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReservation, setShowReservation] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    dispatch(fetchPickupDetails(id)).unwrap();
    return () => {
      dispatch(clearPickupDetails());
    };
  }, [dispatch, id]);

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      loading,
      tourStarted,
      visible,
      currentPickup: !!currentPickup
    });

    if (hasSeenTour === false && !loading && !tourStarted && !visible && currentPickup) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, loading, startTour, tourStarted, visible, currentPickup]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      console.log('Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Tour status saved successfully');
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      console.log('Step changed to:', step);
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    dispatch(toggleSavedStatus());
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(slideIndex);
  };

  const handleReservePress = () => {
    setShowReservation(true);
  };

  const handleCloseReservation = () => {
    setShowReservation(false);
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!currentPickup) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No pickup details found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={title} 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.imageSection}>
          {/* Step 1: Image Gallery */}
          <CopilotStep
            text={i18n.t('copilot.viewVehicleImages')}
            order={1}
            name="imagesStep"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <FlatList
                ref={flatListRef}
                data={currentPickup.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                )}
              />
            </WalkthroughableView>
          </CopilotStep>

          <TouchableOpacity
            style={[styles.saveButton, currentPickup.saved && styles.savedButton]}
            onPress={handleSave}
          >
            <Ionicons
              name={currentPickup.saved ? "bookmark" : "bookmark-outline"}
              size={24}
              color={currentPickup.saved ? "white" : "#666"}
            />
          </TouchableOpacity>

          <View style={styles.paginationContainer}>
            <View style={styles.pagination}>
              {currentPickup.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.activePaginationDot
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.transportTypeContainer}>
            <Text style={styles.transportType}>
              {currentPickup.private ? i18n.t('pickup.privatePickup') : i18n.t('pickup.sharedPickup')}
            </Text>
          </View>

          {/* Step 2: Specifications */}
          <CopilotStep
            text={i18n.t('copilot.checkSpecifications')}
            order={2}
            name="specsStep"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <Text style={styles.sectionTitle}>{i18n.t('transport.specifications')}</Text>

              <View style={styles.specificationsContainer}>
                <View style={styles.specItem}>
                  <Ionicons name="people-outline" size={20} color="#666" />
                  <Text style={styles.specText}>{currentPickup.nbSeats} {i18n.t('transport.seats')}</Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="briefcase-outline" size={20} color="#666" />
                  <Text style={styles.specText}>{currentPickup.bagCapacity} {i18n.t('transport.largeBags')}</Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="car-outline" size={20} color="#666" />
                  <Text style={styles.specText}>{currentPickup.nbDoors} {i18n.t('transport.doors')}</Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="snow-outline" size={20} color="#666" />
                  <Text style={styles.specText}>
                    {currentPickup.airConditioning ? i18n.t('transport.airConditioning') : i18n.t('transport.noAirConditioning')}
                  </Text>
                </View>

                <View style={styles.specItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.specText}>60 {i18n.t('transport.minutes')}</Text>
                </View>
              </View>
            </WalkthroughableView>
          </CopilotStep>

          {/* Step 3: About Section */}
          <CopilotStep
            text={i18n.t('copilot.readAboutService')}
            order={3}
            name="aboutStep"
          >
            <WalkthroughableView style={styles.walkthroughContainer}>
              <Text style={styles.sectionTitle}>{i18n.t('broker.about')}</Text>
              <Text style={styles.aboutText}>{currentPickup.about}</Text>
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </ScrollView>

      {/* Step 4: Reserve Button */}
      <CopilotStep
        text={i18n.t('copilot.reservePickup')}
        order={4}
        name="reserveStep"
      >
        <WalkthroughableView style={styles.walkthroughContainer}>
          <View style={styles.footer}>
            <Button
              title={i18n.t('pickup.reservePickup')}
              style={styles.reserveButton}
              icon={<Ionicons name="car" size={20} color="#fff" style={{ marginRight: 8 }} />}
              onPress={handleReservePress}
            />
          </View>
        </WalkthroughableView>
      </CopilotStep>

      <Modal
        visible={showReservation}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseReservation}
      >
        <ReservationPopup
          onClose={handleCloseReservation}
          title={title}
          price={price}
          pickupId={id}
        />
      </Modal>
    </SafeAreaView>
  );
};

// Wrap the screen content with CopilotProvider
const TransportDetailScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('common.skip'),
        previous: i18n.t('common.previous'),
        next: i18n.t('common.next'),
        finish: i18n.t('common.done')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
    >
      <TransportDetailScreenContent />
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    width: '100%',
    height: 240,
    backgroundColor: '#FFF7F7',
  },
  image: {
    width: width,
    height: 240,
  },
  saveButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    opacity: 0.8,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4C4C4CBF',
    borderColor: '#666',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  savedButton: {
    opacity: 1,
    backgroundColor: '#888888',
    borderColor: '#fff',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  transportTypeContainer: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  transportType: {
    fontSize: 12,
    color: '#4D4D4D',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000',
  },
  specificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
  },
  specText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    marginBottom: 6,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  reserveButton: {
    backgroundColor: '#CE1126',
  },
  walkthroughContainer: {
    width: '100%',
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

export default TransportDetailScreen; 