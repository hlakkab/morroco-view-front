import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import ESIMCardsContainer from '../containers/ESIMCardsContainer';
import BuyESIMModal from '../containers/BuyESIMModal';
import QRCodeModal from '../containers/QRCodeModal';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../types/navigation';
import Button from '../components/Button';
import i18n from '../translations/i18n';

const ESIMScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBuyOne = () => {
    // Show the buy eSIM modal
    setBuyModalVisible(true);
  };

  const handleCloseBuyModal = () => {
    setBuyModalVisible(false);
  };

  const handleCloseQrModal = () => {
    setQrModalVisible(false);
  };

  const handlePurchaseESIM = (operatorId: string) => {
    // This would handle the actual purchase logic
    console.log(`Purchased eSIM from operator: ${operatorId}`);
    // You could add more logic here, like adding the eSIM to your list
    // or navigating to a confirmation screen
    setBuyModalVisible(false);
    setQrModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('qrcode.eSim')} onBack={handleBack} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <ESIMCardsContainer />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={i18n.t('qrcode.buyOne')} onPress={handleBuyOne} />
      </View>

      {/* Buy eSIM Modal */}
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
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  content: {
    paddingHorizontal: 16,
  },
});

export default ESIMScreen;