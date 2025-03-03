import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import BackgroundSvg from '../assets/img/lanch-screen-frame.svg';
import LogoSvg from '../assets/img/morroco-view-logo.svg';

const { width, height } = Dimensions.get('window');

const LaunchScreen = () => {
  const navigation = useNavigation();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding' as never);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#AE191300', '#AE191344', '#F18D8F']}
        style={styles.gradient}
      >
        <View style={styles.backgroundContainer}>
          <BackgroundSvg
            width={width}
            height={height}
            style={styles.backgroundImage}
          />
        </View>
        <View style={styles.logoContainer}>
          <LogoSvg
            width={width * 0.3}
            height={width * 0.3}
            style={styles.logo}
          />
        </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
});

export default LaunchScreen;