import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { Ionicons } from '@expo/vector-icons';

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

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const QRCodesScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.qrCodes);
  
  // Fetch QR codes when component mounts
  useEffect(() => {
    dispatch(fetchQRCodes());
  }, [dispatch]);

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted]);

  // Handle Copilot events
  useEffect(() => {
    const handleStop = () => {
      console.log('Tour completed or stopped');
    };
    
    copilotEvents.on('stop', handleStop);
    
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddQrCode = () => {
    setAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setAddModalVisible(false);
  };

  const handleSaveQrCode = (data: Omit<QRCode, 'id' |'createdAt'>) => {
    dispatch(createQRCode(data));
    setAddModalVisible(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>Tour Guide</Text>
        </TouchableOpacity>
      )}

      {/* Header with back button and title */}
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('qrcode.title')} onBack={handleBack} />
      </View>

      {/* Search bar component */}
      <View style={styles.content}>
        <CopilotStep
          text="Search for your QR codes by name or description"
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar 
              placeholder={i18n.t('qrcode.search')}
              onChangeText={handleSearch}
              onFilterPress={handleFilterPress}
              value={searchQuery}
            />
          </WalkthroughableView>
        </CopilotStep>
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
      <CopilotStep
        text="View and manage your saved QR codes"
        order={2}
        name="qrCodesList"
      >
        <WalkthroughableView style={styles.qrCodesListHighlight}>
          <QRCodesContainer searchQuery={searchQuery} />
        </WalkthroughableView>
      </CopilotStep>

      {/* Footer with add button */}
      <CopilotStep
        text="Add new QR codes to your collection"
        order={3}
        name="addButton"
      >
        <WalkthroughableView style={styles.addButtonHighlight}>
          <View style={styles.footer}>
            <Button title={i18n.t('qrcode.addQrCode')} onPress={handleAddQrCode} />
          </View>
        </WalkthroughableView>
      </CopilotStep>

      {/* Add QR Code Modal */}
      <AddQRCodeModal
        visible={addModalVisible}
        onClose={handleCloseAddModal}
        onSave={handleSaveQrCode}
      />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const QRCodesScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
    >
      <QRCodesScreenContent />
    </CopilotProvider>
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
  searchHighlight: {
    marginBottom: 16,
  },
  qrCodesListHighlight: {
    flex: 1,
  },
  addButtonHighlight: {
    marginBottom: 16,
  },
});

export default QRCodesScreen;