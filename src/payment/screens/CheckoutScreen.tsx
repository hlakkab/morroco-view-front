import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import PaywallWebView from '../components/PaywallWebView';
import { usePaywall } from '../hooks/usePaywall';
import type { PaywallResult, PaywallOrderResult } from '../types';
import { RootStackParamList } from '../../types/navigation';
import { runPaywallCallback } from '../utils/callbackRegistry';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentCheckout'>>();
  const { 
    amount, 
    clientId, 
    description, 
    currency,
    onSuccessCallbackId, 
    onFailureCallbackId,
    successRoute,
    successParams 
  } = route.params ?? {};
  const { status, error, data, isReady, start, reset } = usePaywall({ defaultCurrency: 'MAD' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  useEffect(() => {
    let isMounted = true;

    if (!amount || !clientId) {
      Alert.alert('Payment unavailable', 'Missing payment information. Please try again.');
      navigation.goBack();
      return;
    }

    const beginPayment = async () => {
      try {
        await start({ amount, clientId, description, currency });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Unable to start payment. Please try again.';
        Alert.alert('Payment error', message);
        navigation.goBack();
      }
    };

    beginPayment();

    return () => {
      isMounted = false;
      reset();
    };
  }, [amount, clientId, description, navigation, reset, start]);

  useEffect(() => {
    if (isReady && data && !isProcessing) {
      setShowWebView(true);
    }
  }, [data, isProcessing, isReady]);

  const handleSuccess = useCallback(async (orderResult?: PaywallOrderResult) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      if (onSuccessCallbackId && orderResult) {
        await runPaywallCallback(onSuccessCallbackId, orderResult.orderId, orderResult.status);
      }
      
      reset();
      
      // Navigate to success route if provided, otherwise go back
      if (successRoute) {
        // @ts-ignore - using replace for better UX
        navigation.replace(successRoute, successParams);
      } else {
        navigation.goBack();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment succeeded, but an error occurred. Please contact support.';
      Alert.alert('Processing error', message);
      reset();
      navigation.goBack();
    } finally {
      setIsProcessing(false);
    }
  }, [navigation, onSuccessCallbackId, reset, isProcessing, successRoute, successParams]);

  const handleFailure = useCallback(async (orderResult?: PaywallOrderResult) => {
    if (onFailureCallbackId && orderResult) {
      await runPaywallCallback(onFailureCallbackId, orderResult.orderId, orderResult.status);
    }
    
    Alert.alert('Payment failed', 'Please try again or use a different payment method.');
    reset();
    navigation.goBack();
  }, [navigation, onFailureCallbackId, reset]);

  const handleResult = useCallback((result: PaywallResult, orderResult?: PaywallOrderResult) => {
    setShowWebView(false);
    if (result === 'success') {
      handleSuccess(orderResult);
    } else {
      handleFailure(orderResult);
    }
  }, [handleFailure, handleSuccess]);

  const handleClose = useCallback(() => {
    setShowWebView(false);
    reset();
    navigation.goBack();
  }, [navigation, reset]);

  const showLoader = useMemo(
    () => status === 'loading' || isProcessing || !data || !isReady || !showWebView,
    [data, isProcessing, isReady, showWebView, status]
  );

  return (
    <View style={styles.container}>
      {showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {showWebView && data && (
        <PaywallWebView
          paywallUrl={data.paywallUrl}
          payload={data.payload}
          signature={data.signature}
          onResult={handleResult}
          onClose={handleClose}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default CheckoutScreen;
