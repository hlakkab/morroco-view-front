import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import LogoSvg from '../assets/img/morroco-view-logo.svg';
import Button from '../components/Button';
import Input from '../components/Input';
import i18n from '../translations/i18n';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = () => {
    // Here you would typically make an API call to request password reset
    // For now, we'll just show the success message
    setIsSuccess(true);
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#AE191300', '#AE191344', '#F18D8F']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <LogoSvg width={80} height={80} />
          <Text style={styles.accessText}>{i18n.t('forgotPassword.title')}</Text>
        </View>

        {!isSuccess ? (
          <>
            <Text style={styles.description}>{i18n.t('forgotPassword.description')}</Text>
            <Input 
              placeholder={i18n.t('forgotPassword.email')} 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Button 
              title={i18n.t('forgotPassword.resetButton')} 
              onPress={handleResetPassword} 
              style={styles.button} 
            />
          </>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>{i18n.t('forgotPassword.success')}</Text>
            <Text style={styles.successMessage}>{i18n.t('forgotPassword.emailSent')}</Text>
            <Button
              title={i18n.t('forgotPassword.backToLogin')}
              onPress={handleBackToLogin}
              style={styles.backButton}
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  accessText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    width: '100%',
    maxWidth: 340,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    width: '100%',
    maxWidth: 340,
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  successIcon: {
    fontSize: 30,
    color: '#FFF',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  backButton: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default ForgotPasswordScreen; 