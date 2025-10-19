import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { login, loginWithGoogle } from '../../service';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '27468884706-ss2q9umun6jcmo2r7cv9c4duvouj5g94.apps.googleusercontent.com',
      iosClientId: '27468884706-1vsc596h0d76qq1grrmstfhjig5cdnjc.apps.googleusercontent.com',
      offlineAccess: true,
      //forceCodeForRefreshToken: true,
      scopes: ['openid', 'email', 'profile']
    });
  }, []);

  const handleLogin = async (onSuccess: () => void) => {
    try {
      await login(email, password);
      onSuccess();
    } catch (error) {
      Alert.alert("Error", "Username or password is incorrect");
    }
  };

  const handleGoogleAuth = async (onSuccess: () => void) => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const googleSignInResponse = await GoogleSignin.signIn();
      
      // Get server auth code
      const serverAuthCode = (googleSignInResponse as any).data.serverAuthCode;
      
      if (!serverAuthCode) {
        throw new Error('No authorization code received from Google');
      }
      
      console.log('='.repeat(50));
      console.log('GOOGLE NATIVE ANDROID - AUTHORIZATION CODE:');
      console.log(serverAuthCode);
      console.log('User:', (googleSignInResponse as any).data?.user || (googleSignInResponse as any).user);
      console.log('='.repeat(50));
      
      // Send authorization code to Keycloak via backend
      console.log('🔄 Sending auth code to Keycloak...');
      await loginWithGoogle(serverAuthCode);
      
      onSuccess();
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled sign-in');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('In Progress', 'Sign-in already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available');
      } else {
        console.error('Google Sign-In Error:', error);
        Alert.alert('Error', error.message || 'Failed to sign in with Google');
      }
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    handleGoogleAuth,
  };
};


