import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Provider } from 'react-redux';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import store from './src/store/store';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons, AntDesign, MaterialIcons, Feather, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const SafeNavigationWrapper = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={Platform.OS === 'android' ? {
        flex: 1,
        paddingTop: 0,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      } : {
        flex: 1,
      }}
    >
      {children}
    </View>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    ...AntDesign.font,
    ...MaterialIcons.font,
    ...Feather.font,
    ...MaterialCommunityIcons.font,
    ...FontAwesome.font,
  });

  React.useEffect(() => {
    const ensureIconsReady = async () => {
      if (!(fontsLoaded || fontError)) return;
      try {
        // Explicitly download icon font assets to guarantee availability in production/OTA
        const iconFontModules = [
          require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
          require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf'),
          require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
          require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
          require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
          require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'),
        ];
        await Promise.all(iconFontModules.map((m) => Asset.fromModule(m).downloadAsync()));
      } catch (e) {
        // noop – icons will still attempt lazy-load via vector-icons
      } finally {
        SplashScreen.hideAsync();
      }
    };
    ensureIconsReady();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#CE1126" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <LanguageProvider>
          <AuthProvider>
            <NavigationContainer>
              <SafeNavigationWrapper>
                <AppNavigator />
              </SafeNavigationWrapper>
              <StatusBar style="auto" />
            </NavigationContainer>
          </AuthProvider>
        </LanguageProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
