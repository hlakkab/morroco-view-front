import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

import ESIMCardsContainer from '../containers/ESIMCardsContainer';
import BuyESIMModal from '../containers/BuyESIMModal';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../types/navigation';
import Button from '../components/Button';

const ESIMScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [buyModalVisible, setBuyModalVisible] = useState(false);

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

  const handlePurchaseESIM = (operatorId: string) => {
    // This would handle the actual purchase logic
    console.log(`Purchased eSIM from operator: ${operatorId}`);
    // You could add more logic here, like adding the eSIM to your list
    // or navigating to a confirmation screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="eSIM" onBack={handleBack} />

      <ScrollView style={styles.scrollContainer}>
        <ESIMCardsContainer />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Buy One" onPress={handleBuyOne} />
      </View>

      {/* Buy eSIM Modal */}
      <BuyESIMModal
        visible={buyModalVisible}
        onClose={handleCloseBuyModal}
        onBuy={handlePurchaseESIM}
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
    padding: 16,
  },
  footer: {
    paddingBottom: 25,
    paddingHorizontal: 16,
  }
});

export default ESIMScreen;