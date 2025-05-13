import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { useDispatch, useSelector } from 'react-redux';

import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import BuyESIMModal from '../containers/BuyESIMModal';
import ESIMCardsContainer from '../containers/ESIMCardsContainer';
import QRCodeModal from '../containers/QRCodeModal';
import { AppDispatch, RootState } from '../store';
import { createEsim, fetchEsims } from '../store/slices/esimSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const ESIMScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const { esims, loading, error } = useSelector((state: RootState) => state.esim);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const { start, copilotEvents, visible, stop } = useCopilot();
  const [tourFinished, setTourFinished] = useState(false);

  useEffect(() => {
    dispatch(fetchEsims());
  }, [dispatch]);

  // Start the tour when component mounts (only if not already finished)
  useEffect(() => {
    // Only start the tour if it hasn't been finished before
    if (!tourFinished) {
      // Short delay to ensure the screen is fully rendered
      const timer = setTimeout(() => {
        start();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [start, tourFinished]);

  // Handle copilot events
  useEffect(() => {
    // Function to handle tour completion
    const handleStop = () => {
      console.log('Tour completed or stopped');
      setTourFinished(true); // Mark the tour as finished when stopped
      
      // Force unmount and remount of copilot components to reset state
      const resetTimer = setTimeout(() => {
        // This will help ensure the tour is fully stopped
        stop();
      }, 100);
      
      return () => clearTimeout(resetTimer);
    };

    // Listen for both stop and finish events
    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', (step) => {
      console.log('Step changed to:', step?.name);
    });
    
    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange');
    };
  }, [copilotEvents, stop]);

  const handleBack = () => {
    // Make sure to stop the tour when navigating away
    stop();
    navigation.goBack();
  };

  const handleBuyOne = () => {
    // Stop the tour before opening the modal
    stop();
    setBuyModalVisible(true);
  };

  const handleCloseBuyModal = () => {
    setBuyModalVisible(false);
  };

  const handleCloseQrModal = () => {
    setQrModalVisible(false);
  };

  const handlePurchaseESIM = async (operatorId: string) => {
    try {
      const newEsim = {
        operator: operatorId,
        offer: 'Standard Plan',
        price: 10.99,
        simNumber: `SIM-${Date.now()}`
      };
      
      await dispatch(createEsim(newEsim)).unwrap();
      setBuyModalVisible(false);
      setQrModalVisible(true);
    } catch (error) {
      console.error('Failed to purchase ESIM:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('qrcode.eSim')} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <ESIMCardsContainer esims={esims} loading={loading} error={error} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <CopilotStep
            text={i18n.t('copilot.esim.buyESIM')}
            order={1}
            name="buyEsim"
          >
            <WalkthroughableView style={styles.buttonWrapper}>
              <Button title={i18n.t('qrcode.buyOne')} onPress={handleBuyOne} />
            </WalkthroughableView>
          </CopilotStep>
        </View>
      </View>

      <BuyESIMModal
        visible={buyModalVisible}
        onClose={handleCloseBuyModal}
        onBuy={handlePurchaseESIM}
      />

      <QRCodeModal
        visible={qrModalVisible}
        onClose={handleCloseQrModal}
        qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ESIM-123456789"
      />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const ESIMScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={false}
      labels={{
        skip: i18n.t('copilot.navigation.skip'),
        previous: i18n.t('copilot.navigation.previous'),
        next: i18n.t('copilot.navigation.next'),
        finish: i18n.t('copilot.navigation.finish')
      }}
     arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0} // Remove any vertical offset
    >
      <ESIMScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollContainer: {
    flex: 1,
  },
  footer: {
    paddingBottom: 25,
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
  buttonWrapper: {
    width: '100%', // Ensure the wrapper takes full width
  },
  tooltip: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#CE1126',
    width: '85%',
  },
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#008060',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  buttonContainer: {
    width: '100%',
    // Ensure clear boundaries for the highlighted component
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});

export default ESIMScreen;