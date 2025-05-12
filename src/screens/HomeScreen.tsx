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
            text="Search for destinations, restaurants, or activities"
            order={1}
            name="search"
          >
            <WalkthroughableView style={styles.searchHighlight}>
              <SearchBarContainer/>
            </WalkthroughableView>
          </CopilotStep>
        </View>
        
        {/* Africa Cup Banner Section with fixed height */}
        <View style={styles.componentContainer}>
          <CopilotStep
            text="Check out upcoming events and matches"
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
            text="Access essential services for your stay"
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
            text="Explore different categories of attractions"
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
      stopOnOutsideClick={false}
      labels={{
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
      arrowSize={5} // Smaller arrow for better precision
      arrowColor="#CE1126" // Match the tooltip color
      verticalOffset={0} // Remove any vertical offset
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
    marginTop:30
  },
  bottomPadding: {
    height: 100, 
  },
  // testButton: {
  //   backgroundColor: '#6200EE',
  //   padding: 15,
  //   borderRadius: 10,
  //   marginVertical: 20,
  //   alignItems: 'center',
  // },
  // testButtonText: {
  //   color: 'white',
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
  tooltip: {
    backgroundColor: '#CE1126',
    borderRadius: 10,
  },
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
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