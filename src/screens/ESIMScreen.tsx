import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import ESIMCardsContainer from '../containers/ESIMCardsContainer';
import BuyESIMModal from '../containers/BuyESIMModal';
import QRCodeModal from '../containers/QRCodeModal';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../types/navigation';
import Button from '../components/Button';
import i18n from '../translations/i18n';
import { fetchEsims, createEsim } from '../store/slices/esimSlice';
import { AppDispatch, RootState } from '../store';
import { trackEvent } from '../service/Mixpanel';

const ESIMScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const { esims, loading, error } = useSelector((state: RootState) => state.esim);
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchEsims());
  }, [dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBuyOne = () => {
    trackEvent('BuyEsimModal_Opened');
    setBuyModalVisible(true);
  };

  const handleCloseBuyModal = () => {
    setBuyModalVisible(false);
  };

  const handleCloseQrModal = () => {
    setQrModalVisible(false);
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
        <ScreenHeader title={i18n.t('qrcode.eSim')} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <ESIMCardsContainer esims={esims} loading={loading} error={error} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={i18n.t('qrcode.buyOne')} onPress={handleBuyOne} />
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
});

export default ESIMScreen;