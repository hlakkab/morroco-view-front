import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import BackgroundSvg from '../assets/img/lanch-screen-frame.svg';
import LogoSvg from '../assets/img/morroco-view-logo.svg';
import { getAccessToken } from '../service/KeycloakService';
import i18n from '../translations/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LaunchScreen = () => {
  const navigation = useNavigation();
  
  // Initial position in the center
  const logoTranslateY = useSharedValue(0);
  const logoTranslateX = useSharedValue(0);
  const logoScale = useSharedValue(1);

  const timer = useRef<NodeJS.Timeout | null>(null);

  const checkLoginStatus = async () => {

    const firstTime = await AsyncStorage.getItem('FIRST_TIME');
    if (firstTime === 'false') {
      navigation.navigate('Home' as never);
      return;
    }

    timer.current = setTimeout(() => {
      // Animate logo to top left
      logoTranslateY.value = withTiming(-height / 2 + 90, { duration: 700, easing: Easing.out(Easing.exp) });
      logoTranslateX.value = withTiming(-width / 2 + 80, { duration: 700, easing: Easing.out(Easing.exp) });
      logoScale.value = withTiming(0.6, { duration: 700, easing: Easing.out(Easing.exp) });

      setTimeout(() => {
        navigation.navigate('Onboarding' as never);
      }, 700);
      
    }, 3000);


  }

  useEffect(() => {
    // check the login status
    checkLoginStatus();

    return () => {
      if(timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [navigation, logoTranslateY, logoTranslateX, logoScale]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: logoTranslateY.value },
      { translateX: logoTranslateX.value },
      { scale: logoScale.value }
    ],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#AE191300', '#AE191344', '#F18D8F']} style={styles.gradient}>
        <View style={styles.backgroundContainer}>
          <BackgroundSvg width={width} height={height} style={styles.backgroundImage} />
        </View>
        <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
          <LogoSvg width={width * 0.3} height={width * 0.3} />
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    opacity: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -width * 0.15,
    marginLeft: -width * 0.15,
  },
});

export default LaunchScreen;
