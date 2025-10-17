import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Import screens directly from their screen files
import AccountScreen from '../Account/screens/AccountScreen';
import LoginScreen from '../Account/screens/LoginScreen';
import RegisterScreen from '../Account/screens/RegisterScreen';
import ForgotPasswordScreen from '../Account/screens/ForgotPasswordScreen';

import ArtisanDetailScreen from '../Artisan/screens/ArtisanDetailScreen';
import ArtisansScreen from '../Artisan/screens/ArtisansScreen';

import BookmarkScreen from '../Bookmarks/screens/BookmarkScreen';

import BrokerDetailScreen from '../MoneyExchange/screens/BrokerDetailScreen';
import BrokerListScreen from '../MoneyExchange/screens/BrokerListScreen';
import MoneyExchangeScreen from '../MoneyExchange/screens/MoneyExchangeScreen';

import EmergencyScreen from '../Emergency/screens/EmergencyScreen';

import EntertainmentDetailScreenVo from '../Entertainment/screens/EntertainmentDetailScreenVo';
import EntertainmentScreen from '../Entertainment/screens/EntertainmentScreen';
import EntertainmentScreenVo from '../Entertainment/screens/EntertainmentScreenVo';

import ESIMScreen from '../ESIM/screens/ESIMScreen';

import EventDetailScreen from '../Event/screens/EventDetailScreen';

import ExploreMatchesScreen from '../Match/screens/ExploreMatchesScreen';

import MonumentDetailScreen from '../Monument/screens/MonumentDetailScreen';
import MonumentsListScreen from '../Monument/screens/MonumentsListScreen';
import MonumentsScreen from '../Monument/screens/MonumentsScreen';

import HotelPickupScreen from '../Pickup/screens/HotelPickupScreen';
import TransportDetailScreen from '../Pickup/screens/TransportDetailScreen';

import QRCodesScreen from '../QRCode/screens/QRCodesScreen';

import RestaurantDetailScreen from '../Restaurant/screens/RestaurantDetailScreen';
import RestaurantScreen from '../Restaurant/screens/RestaurantScreen';

import TicketsScreen from '../Tickets/screens/TicketsScreen';

import AddNewTourDestinationsScreen from '../Tours/screens/AddNewTourDestinationsScreen';
import AddNewTourOrganizeScreen from '../Tours/screens/AddNewTourOrganizeScreen';
import AddNewTourScreen from '../Tours/screens/AddNewTourScreen';
import TourMapScreen from '../Tours/screens/TourMapScreen';
import ToursScreen from '../Tours/screens/ToursScreen';

// Import remaining screens not yet organized
import HomeScreen from '../screens/HomeScreen';
import LaunchScreen from '../screens/LaunchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Launch"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Launch"
        component={LaunchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ESIM"
        component={ESIMScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRCodes"
        component={QRCodesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HotelPickup"
        component={HotelPickupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TransportDetail"
        component={TransportDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MoneyExchange"
        component={MoneyExchangeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BrokerList"
        component={BrokerListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BrokerDetail"
        component={BrokerDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Monuments"
        component={MonumentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MonumentDetail"
        component={MonumentDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Artisans"
        component={ArtisansScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ArtisanDetail"
        component={ArtisanDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExploreMatches"
        component={ExploreMatchesScreen}
        options={{ headerShown: false, title: "Africa Cup of Nations" }}
      />
      <Stack.Screen
        name="Bookmark"
        component={BookmarkScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Tickets" 
        component={TicketsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Tours" 
        component={ToursScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Restaurant"
        component={RestaurantScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Entertainment"
        component={EntertainmentScreenVo}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EntertainmentDetail"
        component={EntertainmentDetailScreenVo}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddNewTour" 
        component={AddNewTourScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddNewTourDestinations" 
        component={AddNewTourDestinationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="MarrakechMap" 
        component={TourMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TourMapScreen" 
        component={TourMapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddNewTourOrganize" 
        component={AddNewTourOrganizeScreen}
        options={{ headerShown: false }}
      />
      
    </Stack.Navigator>
  );
}

export { RootStackParamList };

