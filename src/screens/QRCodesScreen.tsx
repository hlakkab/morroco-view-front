import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';

// Import components and containers
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import AddQRCodeModal from '../containers/AddQRCodeModal';
import QRCodesContainer from '../containers/QRCodesContainer';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import QRCode from '../types/qrcode';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { createQRCode, fetchQRCodes } from '../store/qrCodeSlice';

const QRCodesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.qrCodes);
  
  // Fetch QR codes when component mounts
  useEffect(() => {
    dispatch(fetchQRCodes());
  }, [dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddQrCode = () => {
    // Show the add QR code modal
    setAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setAddModalVisible(false);
  };

  const handleSaveQrCode = (data: Omit<QRCode, 'id' |'createdAt'>) => {
    // Dispatch the createQRCode action
    dispatch(createQRCode(data));
    
    // Close the modal after saving
    setAddModalVisible(false);
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
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('qrcode.title')} onBack={handleBack} />
      </View>

      {/* Search bar component */}
      <View style={styles.content}>
        <SearchBar 
          placeholder={i18n.t('qrcode.search')}
          onChangeText={handleSearch}
          onFilterPress={handleFilterPress}
          value={searchQuery}
        />
      </View>

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {/* Container for QR code items */}
      <QRCodesContainer searchQuery={searchQuery} />

      {/* Footer with add button */}
      <View style={styles.footer}>
        <Button title={i18n.t('qrcode.addQrCode')} onPress={handleAddQrCode} />
      </View>

      {/* Add QR Code Modal */}
      <AddQRCodeModal
        visible={addModalVisible}
        onClose={handleCloseAddModal}
        onSave={handleSaveQrCode}
      />
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
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
  errorContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#ffeeee',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff0000',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  content: {
    paddingHorizontal: 16,
  },
});

export default QRCodesScreen;