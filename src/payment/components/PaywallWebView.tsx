import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import type { PaywallResult, PaywallOrderResult } from '../types';

interface PaywallWebViewProps {
  paywallUrl: string;
  payload: string;
  signature: string;
  onResult: (status: PaywallResult, orderResult?: PaywallOrderResult) => void;
  onClose: () => void;
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');


const parseSuccessRequestParams = (
  url: string
): Record<string, string> | null => {
  try {
    // Extract query string from URL
    const queryStringStart = url.indexOf('?');
    if (queryStringStart === -1) {
      return null;
    }

    const queryString = url.substring(queryStringStart + 1);
    const params: Record<string, string> = {};

    // Parse query parameters
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });

    console.log('[PaywallWebView] Parsed params:', params);

    return Object.keys(params).length > 0 ? params : null;
  } catch (err) {
    if (__DEV__) {
      console.warn(
        '[PaywallWebView] Failed to parse success request params from URL',
        url,
        err
      );
    }
    return null;
  }
};

const PaywallWebView: React.FC<PaywallWebViewProps> = ({
  paywallUrl,
  payload,
  signature,
  onResult,
  onClose
}) => {
  const hasProcessedResponseRef = useRef(false);


  const autoSubmitHtml = useMemo(() => {
    const escapedPayload = escapeHtml(payload);
    const escapedSignature = escapeHtml(signature);

    return `
      <html>
        <body>
          <form id="payzone" action="${paywallUrl}" method="POST">
            <input type="hidden" name="payload" value='${escapedPayload}' />
            <input type="hidden" name="signature" value='${escapedSignature}' />
          </form>
          <script>document.getElementById('payzone').submit();</script>
        </body>
      </html>
    `;
  }, [paywallUrl, payload, signature]);


  const handleNavigationChange = useCallback((navState: WebViewNavigation) => {
    if (hasProcessedResponseRef.current) {
      return;
    }

    const url = navState.url;


    if (url.includes("/paywall/success")) {
      hasProcessedResponseRef.current = true;

      const params = parseSuccessRequestParams(url);

      if (params && params.orderId) {
        const orderResult: PaywallOrderResult = {
          orderId: params.orderId,
          status: 'success'
        };

        console.log('[PaywallWebView] Payment successful:', orderResult);
        onResult("success", orderResult);
      } else {
        console.log('[PaywallWebView] Payment successful (no order details)');
        onResult("success");
      }

      onClose();
    } else if (url.includes("/paywall/failure")) {
      hasProcessedResponseRef.current = true;

      const params = parseSuccessRequestParams(url);

      if (params && params.orderId) {
        const orderResult: PaywallOrderResult = {
          orderId: params.orderId,
          status: 'failure'
        };

        console.log('[PaywallWebView] Payment failed:', orderResult);
        onResult("failure", orderResult);
      } else {
        console.log('[PaywallWebView] Payment failed (no order details)');
        onResult("failure");
      }

      onClose();
    }
  }, [onResult, onClose]);

  const webViewRef = useRef<WebView>(null);

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: autoSubmitHtml }}
      javaScriptEnabled
      sharedCookiesEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      )}
      onNavigationStateChange={handleNavigationChange}
    />

  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default PaywallWebView;