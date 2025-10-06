// src/screens/OnboardingScreen.tsx
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import Logo2Svg from '../assets/img/morroco-view-logo2.svg';
import Button from '../components/Button';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo2Svg width={width * 0.5} height={width * 0.15} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{i18n.t('onboarding.seeTitle')}</Text>
        <Text style={styles.subtitle}>{i18n.t('onboarding.seeSubtitle')}</Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/img/maroc_design.png')} 
            style={styles.morocDesignImage}
            resizeMode="contain"
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button title={i18n.t('onboarding.getStarted')} onPress={handleGetStarted} style={styles.fullWidthButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
    padding: 20,
  },
  logoContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    marginTop: 24,
    alignItems: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 24,
    color: '#000',
    marginBottom: 20,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  morocDesignImage: {
    width: width,
    height: height,
    
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    padding: 20,
  },
  fullWidthButton: {
    width: '100%',
  },
});

export default OnboardingScreen;