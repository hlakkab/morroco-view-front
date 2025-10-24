import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { RootStackParamList } from '../types/navigation';
import { lazyScreen } from './LazyScreen';

// ========== EAGER LOAD: Critical Path (5 screens) ==========
// These screens are loaded immediately for optimal startup experience
import LaunchScreen from '../screens/LaunchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../Account/screens/LoginScreen';
import RegisterScreen from '../Account/screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

// ========== LAZY LOAD: All Other Screens (35 screens) ==========
// These screens load on-demand based on user navigation patterns

// Account Module
const AccountScreen = lazyScreen(() => import('../Account/screens/AccountScreen'));
const ForgotPasswordScreen = lazyScreen(() => import('../Account/screens/ForgotPasswordScreen'));

// Artisan Module
const ArtisansScreen = lazyScreen(() => import('../Artisan/screens/ArtisansScreen'));
const ArtisanDetailScreen = lazyScreen(() => import('../Artisan/screens/ArtisanDetailScreen'));

// Bookmark Module
const BookmarkScreen = lazyScreen(() => import('../Bookmarks/screens/BookmarkScreen'));

// Money Exchange Module
const MoneyExchangeScreen = lazyScreen(() => import('../MoneyExchange/screens/MoneyExchangeScreen'));
const BrokerListScreen = lazyScreen(() => import('../MoneyExchange/screens/BrokerListScreen'));
const BrokerDetailScreen = lazyScreen(() => import('../MoneyExchange/screens/BrokerDetailScreen'));

// Emergency Module
const EmergencyScreen = lazyScreen(() => import('../Emergency/screens/EmergencyScreen'));

// Entertainment Module
const EntertainmentScreenVo = lazyScreen(() => import('../Entertainment/screens/EntertainmentScreenVo'));
const EntertainmentDetailScreenVo = lazyScreen(() => import('../Entertainment/screens/EntertainmentDetailScreenVo'));
const EntertainmentScreen = lazyScreen(() => import('../Entertainment/screens/EntertainmentScreen'));

// ESIM Module
const ESIMScreen = lazyScreen(() => import('../ESIM/screens/ESIMScreen'));

// Event Module
const EventDetailScreen = lazyScreen(() => import('../Event/screens/EventDetailScreen'));

// Match Module
const ExploreMatchesScreen = lazyScreen(() => import('../Match/screens/ExploreMatchesScreen'));

// Monument Module
const MonumentsScreen = lazyScreen(() => import('../Monument/screens/MonumentsScreen'));
const MonumentDetailScreen = lazyScreen(() => import('../Monument/screens/MonumentDetailScreen'));
const MonumentsListScreen = lazyScreen(() => import('../Monument/screens/MonumentsListScreen'));

// Pickup/Transport Module
const HotelPickupScreen = lazyScreen(() => import('../Pickup/screens/HotelPickupScreen'));
const TransportDetailScreen = lazyScreen(() => import('../Pickup/screens/TransportDetailScreen'));

// QR Code Module
const QRCodesScreen = lazyScreen(() => import('../QRCode/screens/QRCodesScreen'));

// Restaurant Module
const RestaurantScreen = lazyScreen(() => import('../Restaurant/screens/RestaurantScreen'));
const RestaurantDetailScreen = lazyScreen(() => import('../Restaurant/screens/RestaurantDetailScreen'));

// Tickets Module
const TicketsScreen = lazyScreen(() => import('../Tickets/screens/TicketsScreen'));

// Tours Module
const ToursScreen = lazyScreen(() => import('../Tours/screens/ToursScreen'));
const AddNewTourScreen = lazyScreen(() => import('../Tours/screens/AddNewTourScreen'));
const AddNewTourDestinationsScreen = lazyScreen(() => import('../Tours/screens/AddNewTourDestinationsScreen'));
const AddNewTourOrganizeScreen = lazyScreen(() => import('../Tours/screens/AddNewTourOrganizeScreen'));
const TourMapScreen = lazyScreen(() => import('../Tours/screens/TourMapScreen'));

// Utility Screens
const PlaceholderScreen = lazyScreen(() => import('../screens/PlaceholderScreen'));

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

