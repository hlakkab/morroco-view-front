import * as AppleAuthentication from 'expo-apple-authentication';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, View, Platform } from 'react-native';
import { loginWithApple } from '../service';

interface AppleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
  disabled?: boolean;
  loading?: boolean;
}

export default function AppleSignInButton({ 
  onSuccess, 
  onError, 
  style, 
  disabled = false,
  loading: externalLoading = false
}: AppleSignInButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  const loading = externalLoading || internalLoading;

  const handleSignIn = async () => {
    // Only show Apple Sign-In on iOS devices
    if (Platform.OS !== 'ios') {
      console.log('Apple Sign-In is only available on iOS');
      return;
    }

    try {
      setInternalLoading(true);

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
      const email = (credential as any)?.email as string | undefined;
      const givenName = (credential as any)?.fullName?.givenName as string | undefined;
      const familyName = (credential as any)?.fullName?.familyName as string | undefined;
      
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      console.log('🍎 Apple Sign-In successful');
      console.log('Identity Token:', identityToken ? 'Present' : 'Missing');
      console.log('Authorization Code:', authorizationCode ? 'Present' : 'Missing');

      // Use the service function to handle Apple authentication
      await loginWithApple(authorizationCode || '', identityToken, {
        email,
        givenName,
        familyName,
      });

      console.log('✅ Apple authentication completed successfully');

      // Call success callback
      onSuccess?.();
      
      Alert.alert('Welcome!', 'Signed in with Apple successfully!');
      
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

      // Handle network errors
      if (error.code === 'ECONNABORTED') {
        Alert.alert('Error', 'Request timed out. Please check your internet connection.');
      } else if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Server error occurred';
        Alert.alert('Authentication Error', errorMessage);
        onError?.(errorMessage);
      } else if (error.request) {
        // Network error
        Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
        onError?.('Network error');
      } else {
        // Other errors
        const errorMessage = error.message || 'An unexpected error occurred';
        Alert.alert('Error', errorMessage);
        onError?.(errorMessage);
      }
    } finally {
      setInternalLoading(false);
    }
  };

  // Don't render on non-iOS platforms
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View style={[{ alignItems: 'center', marginVertical: 10 }, style]}>
      {loading ? (
        <View style={{ 
          width: 250, 
          height: 50, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#000',
          borderRadius: 8,
        }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={8}
          style={{ width: 250, height: 50 }}
          onPress={disabled ? () => {} : handleSignIn}
        />
      )}
    </View>
  );
}
