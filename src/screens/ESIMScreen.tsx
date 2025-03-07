import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

import ESIMCardsContainer from '../containers/ESIMCardsContainer';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../types/navigation';
import Button from '../components/Button';
const ESIMScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleBuyOne = () => {
    // Handle buy action
    console.log('Buy eSIM initiated');
    // You could navigate to a payment screen or show a modal here
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