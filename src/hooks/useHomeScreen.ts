import { NavigationProp, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, ScrollView } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import { useAuth } from '../contexts/AuthContext';
import { getAccessToken } from '../service/KeycloakService';
import { RootStackParamList } from '../types/navigation';

const TOUR_FLAG = '@homeTourSeen';

export const useHomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isAuthenticated } = useAuth();

  const [showTourButton, setShowTourButton] = useState(true);
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const checkFirstTime = useCallback(async () => {
    try {
      const isFirstTime = await AsyncStorage.getItem('FIRST_TIME');
      if (isFirstTime === null) {
        setShowFirstTimeModal(true);
      }
    } catch (error) {
      console.error('Error checking first time:', error);
    }
  }, []);

  const handleFirstTimeComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem('FIRST_TIME', 'false');
      setShowFirstTimeModal(false);
    } catch (error) {
      console.error('Error saving first time state:', error);
    }
  }, []);

  const handleMatchesExplore = useCallback(async () => {
    if (!(await isAuthenticated())) {
      setShowAuthModal(true);
      return;
    }
    navigation.navigate('Matches' as never);
  }, [isAuthenticated, navigation]);

  const handleCategoryPress = useCallback(
    (category: string) => {
      const routeNames = navigation.getState().routeNames;

      if (category === 'Restaurant') {
        navigation.navigate('Restaurant' as never);
      } else if (routeNames.includes(category as keyof RootStackParamList)) {
        navigation.navigate(category as keyof RootStackParamList as never);
      }
    },
    [navigation]
  );

  const handleEmergencyContacts = useCallback(() => {
    navigation.navigate('Emergency' as never);
  }, [navigation]);

  const handleNavigation = useCallback(
    async (routeName: string) => {
      if (routeName === 'ESIM') {
        Linking.openURL('https://www.orange.ma/Offres-services/Offres-Mobile/eSIM');
        return;
      }

      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          setShowAuthModal(true);
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setShowAuthModal(true);
        return;
      }

      navigation.navigate(routeName as never);
    },
    [navigation]
  );

  const handleStartTour = useCallback(() => {
    setTourStarted(true);
    startTour();
  }, [startTour]);

  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then((value) => {
        setHasSeenTour(value === 'true');
      })
      .catch((error) => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  useEffect(() => {
    if (hasSeenTour === false && !tourStarted && !visible) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible]);

  useEffect(() => {
    const handleStop = async () => {
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = () => {};

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  useEffect(() => {
    checkFirstTime();
  }, [checkFirstTime]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  return {
    scrollViewRef,
    visible,
    showTourButton,
    tourStarted,
    hasSeenTour,
    showAuthModal,
    setShowAuthModal,
    showFirstTimeModal,
    setShowFirstTimeModal,
    selectedCategory,
    setSelectedCategory,
    handleMatchesExplore,
    handleCategoryPress,
    handleEmergencyContacts,
    handleNavigation,
    handleStartTour,
    handleFirstTimeComplete,
  };
};


