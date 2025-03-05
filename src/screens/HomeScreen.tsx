import React from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

// Import Container Components
import SearchBarContainer from '../containers/SearchBarContainer';
import EventBannerContainer from '../containers/EventBannerContainer';
import ServiceCardsContainer from '../containers/ServiceCardsContainer';
import ExploreCardsContainer from '../containers/ExploreCardsContainer';
import EmergencyContactsButton from '../containers/EmergencyContactsButton';
import BottomNavBar from '../containers/BottomNavBar';

// // Define your app's route params type
// type RootStackParamList = {
//   Home: undefined;
//   Matches: undefined;
//   Monuments: undefined;
//   Restaurant: undefined;
//   Entertainment: undefined;
//   Artisans: undefined;
//   Bookmark: undefined;
//   Tickets: undefined;
//   Tours: undefined;
//   Account: undefined;
// };

// type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  // const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleMatchesExplore = () => {
    // Navigate to matches screen
    // navigation.navigate('Matches' as never);
  };

  const handleCategoryPress = (category: string) => {
    // Navigate to category screen
    // navigation.navigate(category as keyof RootStackParamList);
    console.log(`Navigating to ${category}`);
  };

  const handleEmergencyContacts = () => {
    // Navigate to emergency contacts screen
    // navigation.navigate('EmergencyContacts' as never);
    console.log('Navigating to Emergency Contacts');
    
    // For testing purposes, you can use an alert
    Alert.alert('Emergency Contacts', 'This would navigate to the Emergency Contacts screen');
  };
  
  const handleNavigation = (routeName: string) => {
    // Navigate to the selected route
    // navigation.navigate(routeName as keyof RootStackParamList);
    console.log(`Navigating to ${routeName}`);
    
    // For testing purposes, you can use an alert
    Alert.alert('Navigation', `This would navigate to the ${routeName} screen`);
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Search Bar Section */}
        <SearchBarContainer />
        
        {/* Africa Cup Banner Section */}
        <EventBannerContainer onExplore={handleMatchesExplore} />
        
        {/* Service Icons Section */}
        <ServiceCardsContainer />
        
        {/* Explore Morocco Section */}
        <ExploreCardsContainer onCategoryPress={handleCategoryPress} />

        {/* Emergency Contacts Button */}
        <EmergencyContactsButton onPress={handleEmergencyContacts} />
        
        {/* Add padding at the bottom to ensure content is not hidden behind the nav bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Bottom Navigation Bar */}
      <BottomNavBar activeRoute="Home" onNavigate={handleNavigation} />
    </View>
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
  },
  bottomPadding: {
    height: 80, // Provide enough padding at the bottom to not hide content behind nav bar
  }
});

export default HomeScreen;