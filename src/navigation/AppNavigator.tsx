import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ESIMScreen from '../screens/ESIMScreen';
import HomeScreen from '../screens/HomeScreen';
import HotelPickupScreen from '../screens/HotelPickupScreen';
import LaunchScreen from '../screens/LaunchScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import QRCodesScreen from '../screens/QRCodesScreen';
import TransportDetailScreen from '../screens/TransportDetailScreen';

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  ESIM: undefined;
  QRCodes: undefined;
  HotelPickup: undefined;
  TransportDetail: {
    id: string;
    title: string;
    imageUrl: string;
    price: number;
    isPrivate: boolean;
  };
};

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
    </Stack.Navigator>
  );
}