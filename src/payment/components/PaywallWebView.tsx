import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Linking, BackHandler } from 'react-native';
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
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webViewRef.current) {
        // If WebView can go back, navigate back in WebView
        webViewRef.current.goBack();
        return true; // Prevent default back behavior
      } else {
        // If WebView can't go back, close the payment screen
        onClose();
        return true; // Prevent default back behavior
      }
    });

    return () => backHandler.remove();
  }, [canGoBack, onClose]);


  const autoSubmitHtml = useMemo(() => {
    const escapedPayload = escapeHtml(payload);
    const escapedSignature = escapeHtml(signature);

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              height: 100%;
            }

            form {
              display: flex;
              flex: 1;
            }
          </style>
        </head>
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
    // Update canGoBack state
    setCanGoBack(navState.canGoBack);

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

  const handleShouldStartLoadWithRequest = useCallback((request: any) => {
    const url = request.url;

    // Check if user is trying to navigate to the terms and conditions page
    if (url.includes('mview.ma/conditions-generales-de-vente')) {
      // Open in external browser
      Linking.openURL(url).catch(err => {
        console.error('[PaywallWebView] Failed to open URL:', err);
      });
      // Return false to prevent WebView navigation
      return false;
    }

    // Allow all other navigation
    return true;
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: autoSubmitHtml }}
        javaScriptEnabled
        sharedCookiesEnabled
        startInLoadingState
        style={styles.webview}
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        )}
        onNavigationStateChange={handleNavigationChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 50
  },
  webview: {
    flex: 1,
    margin: 0,
    backgroundColor: 'transparent'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default PaywallWebView;