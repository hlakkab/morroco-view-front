import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView, { WebViewNavigation } from 'react-native-webview';
import type { PaywallResult, PaywallOrderResult } from '../types';
import CreditCardModal, { CreditCardData } from './CreditCardModal';

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
  const [showCardModal, setShowCardModal] = useState(false);

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

    if (url.endsWith('/pwthree/launch')) {
      setShowCardModal(true);
    }

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
  }, [onResult, onClose, setShowCardModal]);


  const webViewRef = useRef<WebView>(null);

  const applyBlurScript = `
    (function() {
      try {
        var styleId = 'rnw-blur-style';
        if (!document.getElementById(styleId)) {
          var style = document.createElement('style');
          style.id = styleId;
          style.innerHTML = 'body, html { transition: filter 0.3s ease; } body.rnw-blurred { filter: blur(8px); pointer-events: none; }';
          document.head.appendChild(style);
        }
        document.body.classList.add('rnw-blurred');
      } catch (error) {
        console.error('[PaywallWebView] Failed to apply blur:', error);
      }
    })();
    true;
  `;

  const removeBlurScript = `
    (function() {
      try {
        document.body.classList.remove('rnw-blurred');
      } catch (error) {
        console.error('[PaywallWebView] Failed to remove blur:', error);
      }
    })();
    true;
  `;

  const handleSubmitCard = (cardData: CreditCardData) => {
    const fillScript = `
      (function() {
        try {
          var card = document.querySelector('#creditCardNumber, input[name="creditCardNumber"], input[name="cardNumber"]');
          var holder = document.querySelector('#accountHolder, input[name="accountHolder"]');
          var cvv = document.querySelector('#securityCode, input[name="securityCode"]');
          var month = document.querySelector('#expirationDate');
          var year = document.querySelector('#expirationYear');

          console.log('=== Form Elements Found ===');
          console.log('Card input:', card, 'Type:', card?.tagName, card?.type);
          console.log('Holder input:', holder, 'Type:', holder?.tagName, holder?.type);
          console.log('CVV input:', cvv, 'Type:', cvv?.tagName, cvv?.type);
          console.log('Month element:', month, 'Type:', month?.tagName, month?.type);
          console.log('Year element:', year, 'Type:', year?.tagName, year?.type);

          if (card) card.value = '${cardData.cardNumber}';
          if (holder) holder.value = '${cardData.cardHolder}';
          if (cvv) cvv.value = '${cardData.cvv}';
          
          // Handle month - could be input or select
          if (month) {
            month.value = '${cardData.expiryMonth}';
            console.log('Month value set to:', month.value);
            
            // For select elements, also trigger change event
            if (month.tagName === 'SELECT') {
              var changeEvt = new Event('change', { bubbles: true });
              month.dispatchEvent(changeEvt);
            }
          }
          
          // Handle year - could be input or select
          if (year) {
            year.value = '${cardData.expiryYear}';
            console.log('Year value set to:', year.value);
            
            // For select elements, also trigger change event
            if (year.tagName === 'SELECT') {
              var changeEvt = new Event('change', { bubbles: true });
              year.dispatchEvent(changeEvt);
            }
          }

          // Trigger input events for all fields
          const evt = new Event('input', { bubbles: true });
          [card, holder, cvv].forEach(el => { 
            if(el) {
              el.dispatchEvent(evt);
              console.log('Dispatched input event for:', el.id || el.name);
            }
          });

          console.log('=== Fill Complete ===');
          window.ReactNativeWebView.postMessage('filled');

          // Auto-submit the form
          var submitBtn = document.querySelector('button[type="submit"], input[type="submit"], button.submit-btn');
          if (submitBtn) {
            submitBtn.click();
            window.ReactNativeWebView.postMessage('submitted');
          }
        } catch (error) {
          console.error('Fill error:', error);
          window.ReactNativeWebView.postMessage('error:' + error.message);
        }
      })();
      true;
    `;

    webViewRef.current?.injectJavaScript(fillScript);
    setShowCardModal(false);
  };

  useEffect(() => {
    if (showCardModal) {
      webViewRef.current?.injectJavaScript(applyBlurScript);
    } else {
      webViewRef.current?.injectJavaScript(removeBlurScript);
    }

    return () => {
      webViewRef.current?.injectJavaScript(removeBlurScript);
    };
  }, [showCardModal]);

  const handleModalClose = useCallback(() => {
    setShowCardModal(false);
    onClose();
  }, [onClose]);

  return (
    <>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: autoSubmitHtml }}
        javaScriptEnabled
        sharedCookiesEnabled
        startInLoadingState
        domStorageEnabled
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        )}
        onNavigationStateChange={handleNavigationChange}
        onMessage={(event) => {
          const data = event.nativeEvent.data;
          console.log('[PaywallWebView] WebView message:', data);
        }}
      />

      <CreditCardModal
        visible={showCardModal}
        onClose={handleModalClose}
        onSubmit={handleSubmitCard}
      />
    </>
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