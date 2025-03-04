import React from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

// Import Container Components
import SearchBarContainer from '../containers/SearchBarContainer';
import EventBannerContainer from '../containers/EventBannerContainer';
import ServiceCardsContainer from '../containers/ServiceCardsContainer';
import ExploreCardsContainer from '../containers/ExploreCardsContainer';
import EmergencyContactsButton from '../containers/EmergencyContactsButton';


// // Define your app's route params type
// type RootStackParamList = {
//   Home: undefined;
//   Matches: undefined;
//   Monuments: undefined;
//   Restaurant: undefined;
//   Entertainment: undefined;
//   Artisans: undefined;
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
    padding: 16,
  },
});

export default HomeScreen;