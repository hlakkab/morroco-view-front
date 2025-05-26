import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import BuyESIMModal from '../containers/BuyESIMModal';
import ESIMCardsContainer from '../containers/ESIMCardsContainer';
import QRCodeModal from '../containers/QRCodeModal';
import { AppDispatch, RootState } from '../store';
import { trackEvent } from '../service/Mixpanel';
import { createEsim, fetchEsims } from '../store/slices/esimSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';

const TOUR_FLAG = '@esimScreenTourSeen';

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
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  useEffect(() => {
    dispatch(fetchEsims());
  }, [dispatch]);

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      loading,
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !loading && !tourStarted && !visible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        start();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, loading, start, tourStarted, visible]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      console.log('Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Tour status saved successfully');
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      console.log('Step changed to:', step?.name);
    };

    // Listen for both stop and finish events
    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);
    
    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  const handleBack = () => {
    // Make sure to stop the tour when navigating away
    stop();
    navigation.goBack();
  };

  const handleBuyOne = () => {
    trackEvent('BuyEsimModal_Opened');
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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    start();
  };

  const handlePurchaseESIM = async (operatorId: string, price: number, offer: string = 'Standard Plan') => {
    try {
      const newEsim = {
        operator: operatorId,
        offer: offer,
        price: price,
        simNumber: `SIM-${Date.now()}`
      };
      
      await dispatch(createEsim(newEsim)).unwrap();
      
      trackEvent('BuyEsimPurchased', {
        operator: operatorId,
        offer: newEsim.offer,
        price: newEsim.price
      });
      
      setBuyModalVisible(false);
      setQrModalVisible(true);
    } catch (error) {
      trackEvent('BuyEsimPurchase_Failed', {
        operator: operatorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      console.error('Failed to purchase ESIM:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('qrcode.eSim')} 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
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
      stopOnOutsideClick={true}
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
  buttonContainer: {
    width: '100%',
    // Ensure clear boundaries for the highlighted component
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});

export default ESIMScreen;