import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { login, loginWithApple } from '../../service';

export const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (onSuccess: () => void) => {
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (error) {
      Alert.alert("Error", "Username or password is incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (onSuccess: () => void) => {
    // Skip Google Sign-In in dev mode to avoid native module errors
    if (__DEV__) {
      Alert.alert('Dev Mode', 'Google Sign-In is disabled in development mode');
      return;
    }

    setLoading(true);
    try {
      // Lazy load Google Sign-In dependencies
      const [{ GoogleSignin, statusCodes }, { loginWithGoogle }] = await Promise.all([
        import('@react-native-google-signin/google-signin'),
        import('../../service')
      ]);

      // Configure on first use
      GoogleSignin.configure({
        webClientId: '27468884706-ss2q9umun6jcmo2r7cv9c4duvouj5g94.apps.googleusercontent.com',
        iosClientId: '27468884706-1vsc596h0d76qq1grrmstfhjig5cdnjc.apps.googleusercontent.com',
        offlineAccess: true,
        scopes: ['openid', 'email', 'profile']
      });

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
      try {
        // Lazy load statusCodes for error handling
        const { statusCodes } = await import('@react-native-google-signin/google-signin');
        
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
      } catch (importError) {
        console.error('Google Sign-In module not available:', importError);
        Alert.alert('Error', 'Google Sign-In not available on this platform');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async (onSuccess: () => void) => {
    if (Platform.OS !== 'ios') {
      console.log('Apple Sign-In is only available on iOS');
      return;
    }

    setLoading(true);
    try {
      // Lazy load Apple Authentication dependencies
      const AppleAuthentication = await import('expo-apple-authentication');
      
      // Check if Apple Authentication is available
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      // Request Apple Sign-In
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, authorizationCode } = credential;
      
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      console.log('🍎 Apple Sign-In successful');
      console.log('Identity Token:', identityToken ? 'Present' : 'Missing');
      console.log('Authorization Code:', authorizationCode ? 'Present' : 'Missing');

      // Use the service function to handle Apple authentication
      await loginWithApple(authorizationCode || '', identityToken);

      console.log('✅ Apple authentication completed successfully');
      
      onSuccess();
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      
      // Handle specific Apple Sign-In errors
      if (error.code === 'ERR_CANCELED') {
        console.log('User canceled Apple Sign-In');
        return; // Don't show error for user cancellation
      } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        console.log('Apple Sign-In request not handled');
        return;
      } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
        console.log('Apple Sign-In request not interactive');
        return;
      } else if (error.code === 'ERR_UNKNOWN') {
        console.log('Unknown Apple Sign-In error');
        return;
      }

      // Handle other errors
      const errorMessage = error.message || 'An unexpected error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleLogin,
    handleGoogleAuth,
    handleAppleAuth,
  };
};


