import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
// Import Container Components
import { Ionicons } from '@expo/vector-icons';
import BottomNavBar from '../containers/BottomNavBar';
import EmergencyContactsButton from '../containers/EmergencyContactsButton';
import EventBannerContainer from '../containers/EventBannerContainer';
import ExploreCardsContainer from '../containers/ExploreCardsContainer';
import SearchBarContainer from '../containers/SearchBarContainer';
import ServiceCardsContainer from '../containers/ServiceCardsContainer';
import { RootStackParamList } from '../types/navigation';

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
  const { start, copilotEvents, visible, stop } = useCopilot();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showTourButton, setShowTourButton] = useState(true);

  const handleMatchesExplore = () => {
    // Navigate to matches screen
    navigation.navigate('Matches');
  };

  const handleCategoryPress = (category: string) => {
    const routeNames = navigation.getState().routeNames;

    if (category === 'Restaurant') {
      navigation.navigate('Restaurant'); // Navigation spécifique pour Restaurant
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

  const handleNavigation = (routeName: string) => {
    // Use a type assertion to tell TypeScript that routeName is a valid key
    // @ts-ignore - We're handling navigation in a generic way
    navigation.navigate(routeName);
  };

  // Start the tour when the button is pressed
  const handleStartTour = () => {
    start();
  };

  return (
    <View style={styles.mainContainer}>
      {/* Always show tour button (for reusability) */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>App Tour</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar Section with fixed height */}
        <View style={styles.componentSearchContainer}>
          <CopilotStep
            text="Search for your favorite destinations, restaurants, or activities across Morocco!"
            order={1}
            name="search"
          >
            <WalkthroughableView style={styles.searchHighlight}>
              <SearchBarContainer />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Africa Cup Banner Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text="Don't miss exciting events and matches happening during your visit to Morocco!"
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
            text="Access essential services to make your stay in Morocco comfortable and enjoyable!"
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
            text="Discover Morocco's beauty by exploring different categories of attractions and hidden gems!"
            order={4}
            name="explore"
          >
            <WalkthroughableView style={styles.exploreHighlight}>
              <ExploreCardsContainer onCategoryPress={handleCategoryPress} />
            </WalkthroughableView>
          </CopilotStep>
        </View>

        {/* Emergency Contacts Button - Removed from tour */}
        <EmergencyContactsButton onPress={handleEmergencyContacts} />

        {/* Add padding at the bottom to ensure content is not hidden behind the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeRoute="Home" onNavigate={handleNavigation} />
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
        skip: "Skip",
        previous: "Back",
        next: "Next",
        finish: "Done"
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
  searchHighlight: {
    // Fixed height for search container - adjust as needed
    height: 65,
    // width: '100%',
    // overflow: 'hidden',
    // marginBottom: 0,
  },
  bannerHighlight: {
    // Fixed height for banner container - adjust as needed
    // height: 250, 
    // width: '100%',
    // overflow: 'hidden',
    // marginBottom: 0,
    paddingBottom: 10

  },
  servicesHighlight: {
    // Fixed height for services container - adjust as needed
    // height: 135, 
    // width: '100%',
    // overflow: 'hidden',
    // marginBottom: 0,
    paddingBottom: 10

  },
  exploreHighlight: {
    // Fixed height for explore container - adjust as needed
    // height: 260, 
    // width: '100%',
    // overflow: 'hidden',
    // marginBottom: 0,

  },
  componentSearchContainer: {
  },
  componentContainer: {
  },
});

export default HomeScreen;