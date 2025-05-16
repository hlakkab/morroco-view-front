import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import OnboardingPopup from '../components/OnboardingPopup';
import ScreenHeader from '../components/ScreenHeader';
import BottomNavBar from '../containers/BottomNavBar';
import TourListContainer from '../containers/TourListContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTours } from '../store/tourSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';

const ONBOARDING_FLAG = '@toursOnboardingSeen';
const TOUR_FLAG = '@toursCopilotSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Onboarding steps
const onboardingSteps = [
  {
    id: 'explore',
    title: i18n.t('tours.onboarding.explore.title') || 'Explore Morocco',
    description: i18n.t('tours.onboarding.explore.description') || 'Start by exploring our collection of restaurants, monuments, artisans, and entertainment options. Discover the best spots to visit during your trip.',
    icon: 'compass',
    iconColor: '#CE1126'
  },
  {
    id: 'events',
    title: i18n.t('tours.onboarding.events.title') || 'Check Upcoming Events',
    description: i18n.t('tours.onboarding.events.description') || 'Browse upcoming matches and events to include in your itinerary. Plan your trip around these special occasions.',
    icon: 'calendar',
    iconColor: '#008060'
  },
  {
    id: 'bookmark',
    title: i18n.t('tours.onboarding.bookmark.title') || 'Save Your Favorites',
    description: i18n.t('tours.onboarding.bookmark.description') || 'As you explore, bookmark the places and events you want to include in your tour. You can find all your saved items in the Bookmark tab.',
    icon: 'bookmark',
    iconColor: '#CE1126'
  },
  {
    id: 'create',
    title: i18n.t('tours.onboarding.create.title') || 'Create Your Tour',
    description: i18n.t('tours.onboarding.create.description') || 'Now you are ready to create a customized tour! Select your bookmarked items, set dates, and plan your perfect Moroccan adventure.',
    icon: 'map',
    iconColor: '#008060'
  }
];

// Content component for copilot
const ToursScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.tour);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Fetch tours and check onboarding status
  useEffect(() => {
    dispatch(fetchTours());
    checkOnboardingStatus();
  }, [dispatch]);

  // Function to check onboarding status
  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_FLAG);
      const shouldShowOnboarding = value !== 'true';
      setShowOnboarding(shouldShowOnboarding);
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error reading onboarding status:', error);
      setShowOnboarding(true);
      setHasSeenOnboarding(false);
    }
  };

  // Function to manually show onboarding
  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  // Handle onboarding close
  const handleOnboardingClose = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_FLAG, 'true');
      setHasSeenOnboarding(true);
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  // Check copilot tour status
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Copilot tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading copilot tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // Start copilot tour after onboarding is closed and if not seen before
  useEffect(() => {
    if (!showOnboarding && hasSeenOnboarding && hasSeenTour === false && !tourStarted && !visible) {
      console.log('Starting copilot tour...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding, hasSeenOnboarding, hasSeenTour, tourStarted, visible, startTour]);

  // Save copilot tour completion status
  useEffect(() => {
    const handleStop = async () => {
      console.log('Copilot tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Copilot tour status saved successfully');
      } catch (error) {
        console.error('Error saving copilot tour status:', error);
      }
    };

    copilotEvents.on('stop', handleStop);
    return () => copilotEvents.off('stop', handleStop);
  }, [copilotEvents]);

  // Manual tour start handler
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  const handleBack = () => {
    // Simply navigate to Home screen when back button is pressed
    // This avoids the circular navigation issue
    navigation.navigate('Home');
  };

  const handleAddTour = () => {
    navigation.navigate('AddNewTour');
  };

  const handleNavigation = (routeName: string) => {
    // Use a type assertion to tell TypeScript that routeName is a valid key
    // @ts-ignore - We're handling navigation in a generic way
    navigation.navigate(routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      

      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('navigation.tours')} 
          onBack={handleBack} 
          showTour={!visible}
          onTourPress={handleStartTour}
          showOnboarding={true}
          onOnboardingPress={handleShowOnboarding}
        />
      </View>
      
      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.addTour')}
          order={1}
          name="add-tour"
        >
          <WalkthroughableView>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddTour}
            >
              <Ionicons name="add" size={25} color="#FFFFFF" style={{ backgroundColor: '#AE1913', borderRadius: 25, padding: 4}} />
              <Text style={styles.addButtonText}>{i18n.t('tours.addNewTour')}</Text>
            </TouchableOpacity>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.viewTours')}
          order={2}
          name="tour-list"
        >
          <WalkthroughableView style={styles.tourListHighlight}>
            <TourListContainer />
          </WalkthroughableView>
        </CopilotStep>
      </View>

      <OnboardingPopup 
        visible={showOnboarding}
        onClose={handleOnboardingClose}
        steps={onboardingSteps}
        title={i18n.t('tours.onboarding.title')}
        subtitle={i18n.t('tours.onboarding.subtitle')}
      />

      <BottomNavBar activeRoute="Tours" onNavigate={handleNavigation} />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const ToursScreen: React.FC = () => {
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
      <ToursScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 60,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F7',
    borderWidth: 2,
    borderColor: '#AE1913',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#AE1913',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tourListHighlight: {
    flex: 1,
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
});

export default ToursScreen; 