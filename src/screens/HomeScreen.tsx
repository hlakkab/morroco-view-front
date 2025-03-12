import React from 'react';
import { StyleSheet, ScrollView, View, Alert, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

// Import Container Components
import SearchBarContainer from '../containers/SearchBarContainer';
import EventBannerContainer from '../containers/EventBannerContainer';
import ServiceCardsContainer from '../containers/ServiceCardsContainer';
import ExploreCardsContainer from '../containers/ExploreCardsContainer';
import EmergencyContactsButton from '../containers/EmergencyContactsButton';
import BottomNavBar from '../containers/BottomNavBar';
import { RootStackParamList } from '../types/navigation';
import { clearTokens } from '../service/KeycloakService';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleMatchesExplore = () => {
    // Navigate to matches screen
    navigation.navigate('Matches');
  };

  const handleCategoryPress = (category: string) => {
    // Navigate to category screen based on string parameter
    // We need to check if the category is a valid key in our RootStackParamList
    if (category in navigation.getState().routeNames) {
      navigation.navigate(category as keyof RootStackParamList);
    } else {
      console.log(`Invalid navigation destination: ${category}`);
    }
  };

  const handleEmergencyContacts = () => {
    // Navigate to emergency contacts screen
    navigation.navigate('EmergencyContacts');
  };
  
  const handleNavigation = (routeName: string) => {
    const routes = navigation.getState().routeNames as Array<keyof RootStackParamList>;
    if (routes.includes(routeName as keyof RootStackParamList)) {
      navigation.navigate(routeName as keyof RootStackParamList);
    } else {
      console.log(`Invalid navigation destination: ${routeName}`);
      Alert.alert('Navigation', `This would navigate to the ${routeName} screen`);
    }
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
        
        {/* Test Screen Button */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => {
            clearTokens();
            navigation.navigate('Login' as never);
          }}
        >
          <Text style={styles.testButtonText}>Logout</Text>
        </TouchableOpacity>
        
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
    height: 80, 
  },
  testButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default HomeScreen;