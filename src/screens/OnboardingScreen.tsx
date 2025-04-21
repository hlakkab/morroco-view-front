// src/screens/OnboardingScreen.tsx
import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Logo2Svg from '../assets/img/morroco-view-logo2.svg';
import Button from '../components/Button';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
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
          <View style={[styles.imageBox, styles.image1]} />
          <View style={[styles.imageBox, styles.image2]} />
          <View style={[styles.imageBox, styles.image3]} />
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
    marginTop: 50, // Adjust to position logo at the top
    alignItems: 'flex-start',
  },
  titleContainer: {
    marginTop: 30,
    alignItems: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 26,
    color: '#000',
    marginBottom: 40,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  imageBox: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 12,
  },
  image1: {
    backgroundColor: '#FFE4E4',
    transform: [{ rotate: '-15deg' }],
  },
  image2: {
    backgroundColor: '#F18D8F',
    transform: [{ rotate: '5deg' }],
  },
  image3: {
    backgroundColor: '#AE1913',
    transform: [{ rotate: '15deg' }],
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  fullWidthButton: {
    width: '100%',
  },
});

export default OnboardingScreen;