import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AccountScreen from '../screens/AccountScreen';
import AddNewTourScreen from '../screens/AddNewTourScreen';
import BookmarkScreen from '../screens/BookmarkScreen';
import BrokerDetailScreen from '../screens/BrokerDetailScreen';
import BrokerListScreen from '../screens/BrokerListScreen';
import EntertainmentScreen from '../screens/EntertainmentScreen';
import ESIMScreen from '../screens/ESIMScreen';
import ExploreMatchesScreen from '../screens/ExploreMatchesScreen';
import HomeScreen from '../screens/HomeScreen';
import HotelPickupScreen from '../screens/HotelPickupScreen';
import LaunchScreen from '../screens/LaunchScreen';
import LoginScreen from '../screens/LoginScreen';
import MoneyExchangeScreen from '../screens/MoneyExchangeScreen';
import MonumentDetailScreen from '../screens/MonumentDetailScreen';
import MonumentsListScreen from '../screens/MonumentsListScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import QRCodesScreen from '../screens/QRCodesScreen';
import RestaurantDetailScreen from '../screens/RestaurantDetailScreen';
import RestaurantScreen from '../screens/RestaurantScreen';
import TicketsScreen from '../screens/TicketsScreen';
import ToursScreen from '../screens/ToursScreen';
import TransportDetailScreen from '../screens/TransportDetailScreen';
import { RootStackParamList } from '../types/navigation';
import AddNewTourDestinationsScreen from '../screens/AddNewTourDestinationsScreen';
import EntertainmentScreenVo from '../screens/EntertainmentScreenVo';
import EntertainmentDetailScreenVo from '../screens/EntertainmentDetailScreenVo';

// export type RootStackParamList = {
//   Launch: undefined;
//   Onboarding: undefined;
//   Login: undefined;
//   Home: undefined;
//   ESIM: undefined;
//   QRCodes: undefined;
//   HotelPickup: undefined;
//   Bookmark: undefined;
//   Restaurant: undefined;
//   RestaurantDetail: {
//     id: string;
//     title: string;
//     image?: string;
//     images?: string[]; // Assurez-vous que le type correspond à ce que vous passez
//     address?: string;
//     startTime?: string;
//     endTime?: string;
//   }; 
//    TransportDetail: {
//     id: string;
//     title: string;
//     imageUrl: string;
//     price?: number;
//     isPrivate?: boolean;
//   };
//   BrokerDetail: {
//     id: string;
//     name: string;
//     imageUrl?: string;
//     location: string;
//     rating?: number;
//     isFeatured?: boolean;
//     exchangeRates?: {
//       buy: number;
//       sell: number;
//     };
//     services?: string[];
//     operatingHours?: string;
//     contactNumber?: string;
//     website?: string;
//     about?: string;
//     isSaved?: boolean;
//   };
//   Test: undefined;
//   MoneyExchange: undefined;
//   BrokerList: undefined;
//   ExploreMatches: undefined;
//   Tickets: undefined;
//   Tours: undefined;
//   Account: undefined;
//   Matches: undefined;
//   Monuments: undefined;
//   Entertainment: undefined;
//   Artisans: undefined;
//   EmergencyContacts: undefined;
// };

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
        component={MonumentsListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MonumentDetail"
        component={MonumentDetailScreen}
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


      {/*<Stack.Screen 
        name="Entertainment" 
        component={EntertainmentScreen}
        options={{ headerShown: false }}
      />*/}
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
    </Stack.Navigator>
  );
}