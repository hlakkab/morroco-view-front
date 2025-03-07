import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';

// Import components and containers
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import QRCodesContainer from '../containers/QRCodesContainer';
import Button from '../components/Button';
import { RootStackParamList } from '../types/navigation';

const QRCodesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddQrCode = () => {
    // Handle add QR code action
    console.log('Add QR Code initiated');
    // You could navigate to an add QR code screen here
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    // Handle filter button press
    console.log('Filter pressed');
    // Could show a filter modal or navigate to a filter screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button and title */}
      <ScreenHeader title="QR Codes" onBack={handleBack} />

      {/* Search bar component */}
      <SearchBar 
        onChangeText={handleSearch}
        onFilterPress={handleFilterPress}
      />

      {/* Container for QR code items */}
      <QRCodesContainer searchQuery={searchQuery} />

      {/* Footer with add button */}
      <View style={styles.footer}>
        <Button title="Add A QR Code" onPress={handleAddQrCode} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  }
});

export default QRCodesScreen;