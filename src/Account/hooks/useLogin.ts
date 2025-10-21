import { useState } from 'react';
import { Alert } from 'react-native';
import { login } from '../../service';

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
  };
};


