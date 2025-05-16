import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';

// Import components and containers
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import AddQRCodeModal from '../containers/AddQRCodeModal';
import QRCodesContainer from '../containers/QRCodesContainer';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import QRCode from '../types/qrcode';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { createQRCode, fetchQRCodes } from '../store/qrCodeSlice';

const TOUR_FLAG = '@qrCodesScreenTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const QRCodesScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const { start, copilotEvents, visible, stop } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  


  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.qrCodes);
  
  // Fetch QR codes when component mounts
  useEffect(() => {
    dispatch(fetchQRCodes());
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
  


  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    start();
  };

  const handleBack = () => {
    // Make sure to stop the tour when navigating away
    stop();
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

      {/* Header with back button and title */}
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('qrcode.title')} 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>

      {/* Search bar component */}
      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchQRCodes')}
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
        text={i18n.t('copilot.manageQRCodes')}
        order={2}
        name="qrCodesList"
      >
        <WalkthroughableView style={styles.qrCodesListHighlight}>
          <QRCodesContainer searchQuery={searchQuery} />
        </WalkthroughableView>
      </CopilotStep>

      {/* Footer with add button */}
      <CopilotStep
        text={i18n.t('copilot.addNewQRCode')}
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
      stopOnOutsideClick={false}
      labels={{
        skip: i18n.t('common.skip'),
        previous: i18n.t('common.previous'),
        next: i18n.t('common.next'),
        finish: i18n.t('common.done')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
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