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

  useEffect(() => {
    dispatch(fetchTours());
    // Always show onboarding popup
    setShowOnboarding(true);
  }, [dispatch]);

  // Handle onboarding close
  const handleOnboardingClose = async () => {
    setShowOnboarding(false);
    // Remove AsyncStorage saving
    // Start the copilot tour after onboarding closes
    setTimeout(() => {
      startTour();
      setTourStarted(true);
    }, 500);
  };

  // Start the Copilot tour when the component mounts (if onboarding is not shown)
  useEffect(() => {
    if (!tourStarted && !showOnboarding) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted, showOnboarding]);

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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
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
        <ScreenHeader title={i18n.t('navigation.tours')} onBack={handleBack} />
      </View>
      
      <View style={styles.content}>
        <CopilotStep
          text="Create a new custom tour by selecting bookmarked places and events"
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
          text="View and manage your existing tours"
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
        title={i18n.t('tours.onboarding.title') || "Welcome to Tours"}
        subtitle={i18n.t('tours.onboarding.subtitle') || "Create personalized itineraries for your Moroccan adventure by following these simple steps:"}
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
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
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

export default ToursScreen; 