import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import BackgroundSvg from '../assets/img/lanch-screen-frame.svg';
import LogoSvg from '../assets/img/morroco-view-logo.svg';
import { getAccessToken } from '../service/KeycloakService';

const { width, height } = Dimensions.get('window');

const LaunchScreen = () => {
  const navigation = useNavigation();
  
  // Initial position in the center
  const logoTranslateY = useSharedValue(0);
  const logoTranslateX = useSharedValue(0);
  const logoScale = useSharedValue(1);

  useEffect(() => {
    // check the login status
    getAccessToken().then((token) => {
      if (token) {
        console.log('token', token);
        navigation.navigate('Home' as never);
      }
    });
    
    
    const timer = setTimeout(() => {
      // Animate logo to top left
      logoTranslateY.value = withTiming(-height / 2 + 90, { duration: 700, easing: Easing.out(Easing.exp) });
      logoTranslateX.value = withTiming(-width / 2 + 80, { duration: 700, easing: Easing.out(Easing.exp) });
      logoScale.value = withTiming(0.6, { duration: 700, easing: Easing.out(Easing.exp) });

      setTimeout(() => {
        navigation.navigate('Onboarding' as never);
      }, 700);
    }, 3000);

    return () => clearTimeout(timer);
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
