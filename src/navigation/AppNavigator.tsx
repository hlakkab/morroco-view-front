import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LaunchScreen from '../screens/LaunchScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ExploreMatchesScreen from '../screens/ExploreMatchesScreen';
import { Button } from 'react-native';
import BackButton from '../components/BackButton';

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  ExploreMatches: undefined;
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
        name="ExploreMatches" 
        component={ExploreMatchesScreen}
        options={{ headerShown: false, title: "Africa Cup of Nations"  }}
      
     
      />

    </Stack.Navigator>
  );
} 