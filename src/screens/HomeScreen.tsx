import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text, Image } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
// Import Container Components
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavBar from '../containers/BottomNavBar';
import EmergencyContactsButton from '../containers/EmergencyContactsButton';
import EventBannerContainer from '../containers/EventBannerContainer';
import ExploreCardsContainer from '../containers/ExploreCardsContainer';
import SearchBarContainer from '../containers/SearchBarContainer';
import ServiceCardsContainer from '../containers/ServiceCardsContainer';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { getAccessToken } from '../service/KeycloakService';

const TOUR_FLAG = '@homeTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Step interface from react-native-copilot
interface StepType {
  name: string;
  order: number;
  visible: boolean;
  text: string;
}

const HomeScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { start: startTour, copilotEvents, visible, stop } = useCopilot();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showTourButton, setShowTourButton] = useState(true);
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !tourStarted && !visible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible]);

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

  useEffect(() => {
    checkFirstTime();
  }, []);

  const checkFirstTime = async () => {
    try {
      const isFirstTime = await AsyncStorage.getItem('FIRST_TIME');
      if (isFirstTime === null) {
        setShowFirstTimeModal(true);
      }
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  };

  const handleFirstTimeComplete = async () => {
    try {
      await AsyncStorage.setItem('FIRST_TIME', 'false');
    } catch (error) {
      console.error('Error saving first time state:', error);
    }
  };

  const handleMatchesExplore = () => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    navigation.navigate('Matches');
  };

  const handleCategoryPress = (category: string) => {
    const routeNames = navigation.getState().routeNames;

    if (category === 'Restaurant') {
      navigation.navigate('Restaurant');
    } else if (routeNames.includes(category as keyof RootStackParamList)) {
      navigation.navigate(category as keyof RootStackParamList as never);
    } else {
      console.log(`Invalid navigation destination: ${category}`);
    }
  };

  const handleEmergencyContacts = () => {
    // Navigate to emergency contacts screen
    navigation.navigate('Emergency');
  };

  const handleNavigation = async (routeName: string) => {
    
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setShowAuthModal(true);
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setShowAuthModal(true);
        return;
      }
    
    
    navigation.navigate(routeName as never);
  };

  // Start the tour when the button is pressed
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.mainContainer}>
      {/* Tour button commented out as requested */}
      {/*
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      */}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar Section with fixed height */}
        <View style={styles.componentSearchContainer}>
          <CopilotStep
            text={i18n.t('copilot.exploreDestinations')}
            order={1}
            name="search"
          >
            <WalkthroughableView style={styles.searchHighlight}>
              <SearchBarContainer 
                showTour={!visible && showTourButton} 
                onTourPress={handleStartTour} 
              />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Africa Cup Banner Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text={i18n.t('copilot.discoverEvents')}
            order={2}
            name="event"
          >
            <WalkthroughableView style={styles.bannerHighlight}>
              <EventBannerContainer onExplore={handleMatchesExplore} />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Service Icons Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text={i18n.t('copilot.accessServices')}
            order={3}
            name="services"
          >
            <WalkthroughableView style={styles.servicesHighlight}>
              <ServiceCardsContainer />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Explore Morocco Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text={i18n.t('copilot.discoverCategories')}
            order={4}
            name="explore"
          >
            <WalkthroughableView style={styles.exploreHighlight}>
              <ExploreCardsContainer onCategoryPress={handleCategoryPress} />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Emergency Contacts Button - Removed from tour */}
        <CopilotStep
          text={i18n.t('copilot.findEmergency')}
          order={5}
          name="emergency"
        >
          <WalkthroughableView style={styles.emergencyHighlight}>
            <EmergencyContactsButton onPress={handleEmergencyContacts} />
          </WalkthroughableView>
        </CopilotStep>
        {/* Add padding at the bottom to ensure content is not hidden behind the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavBar activeRoute="Home" onNavigate={handleNavigation} />

      {/* Bottom Navigation Bar */}
      {/* <CopilotStep
        text={i18n.t('copilot.navigateApp')}
        order={6}
        name="navbar"
      >
        <WalkthroughableView style={styles.navbarHighlight}>
          <BottomNavBar activeRoute="Home" onNavigate={handleNavigation} />
        </WalkthroughableView>
      </CopilotStep> */}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="auth"
      />

      <AuthModal
        visible={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
        type="firstTime"
        onFirstTimeComplete={handleFirstTimeComplete}
      />
    </View>
  );
};

const HomeScreen: React.FC = () => {
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
      <HomeScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
    marginTop: 30
  },
  bottomPadding: {
    height: 100,
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
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
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
  searchHighlight: {
    height: 65, 
    
  },
  bannerHighlight: {
    
    paddingBottom: 10

  },
  servicesHighlight: {
    
    paddingBottom: 10

  },
  exploreHighlight: {

  },
  componentSearchContainer: {
  },
  componentContainer: {
  },
  emergencyHighlight: {

  },
  navbarHighlight: {

  },
});

export default HomeScreen;