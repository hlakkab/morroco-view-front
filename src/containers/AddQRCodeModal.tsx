import { Ionicons } from '@expo/vector-icons';
import * as BarCodeScanner from 'expo-barcode-scanner';
import { CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import QRCodeSVG from 'react-native-qrcode-svg';
import Button from '../components/Button';
import { useCamera } from '../hooks/useCamera';
import i18n from '../translations/i18n';
import QRCode from '../types/qrcode';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

interface AddQRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (qrCode: Omit<QRCode, 'id' | 'createdAt'>) => void;
}

// Simple QR code component using SVG
const QRCodeDisplay: React.FC<{ value: string, size: number }> = ({ value, size }) => {
  // This is a simplified QR code representation (not a real QR code)
  // In a real app, you would use a proper QR code generation library
  return (
    <QRCodeSVG
      value={value}
      size={size}
      color="black"
      backgroundColor="white"
    />
  );
};

// Content component with Copilot functionality
const AddQRCodeModalContent: React.FC<AddQRCodeModalProps> = ({ 
  visible, 
  onClose,
  onSave
}) => {
  // State for form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [data, setData] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  const { start: startTour, copilotEvents, visible: tourVisible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  
  // Use the camera hook
  const {
    cameraPermission,
    galleryPermission,
    hasScanned,
    setHasScanned,
    scannerVisible,
    setScannerVisible,
    scannedData,
    setScannedData,
    requestPermissions,
    openScanner,
    closeScanner,
    resetScanner,
    handleBarCodeScanned,
    takePictureWithCamera,
    pickImageFromGallery
  } = useCamera();

  // Start the tour automatically when the modal becomes visible
  useEffect(() => {
    if (visible && !tourStarted) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, startTour, tourStarted]);

  // Handle copilot events
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

  // Create animated value for drag gesture
  const pan = React.useRef(new Animated.ValueXY()).current;
  
  // Create pan responder for drag to dismiss
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement and only when keyboard is not visible
        if (gestureState.dy > 0 && !keyboardVisible) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 && !keyboardVisible) {
          // If dragged down more than 100 units, close the modal
          handleClose();
        } else {
          // Otherwise, reset position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Reset the pan position when keyboard shows
        pan.setValue({ x: 0, y: 0 });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Reset pan and form when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
      
      // Request permissions when modal opens
      requestPermissions();
    }
  }, [visible, pan]);

  // Update data when scannedData changes
  useEffect(() => {
    if (scannedData) {
      setData(scannedData);
      
      // Auto-generate title if empty
      if (!title) {
        setTitle(`Scanned QR Code ${new Date().toLocaleTimeString()}`);
      }
    }
  }, [scannedData]);

  const handleClose = () => {
    // Dismiss keyboard if it's visible
    Keyboard.dismiss();
    
    // Reset form fields
    setTitle('');
    setDescription('');
    setData('');
    setImageUri(undefined);
    setScannedData(null);
    closeScanner();
    onClose();
  };

  const handleSave = () => {
    // Validate and save QR code
    if (title.trim() && data) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        data
      });
      handleClose();
    } else if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
    } else if (!data) {
      Alert.alert('Error', 'Please scan a QR code or enter data');
    }
  };

  const handleOpenScanner = async () => {
    await openScanner();
  };


  const handlePickImage = async () => {
    // Show options for camera or gallery
    Alert.alert(
      i18n.t('qrcode.selectOption'),
      '',
      [
        {
          text: i18n.t('qrcode.scan'),
          onPress: handleOpenScanner
        },
        {
          text: i18n.t('qrcode.chooseFromGallery'),
          onPress: async () => {
            const result = await pickImageFromGallery();
            if (result) {
              setImageUri(result.imageUri);
              if (result.scannedData) {
                setData(result.scannedData.data);
                
                // Show confirmation dialog
                Alert.alert(
                  i18n.t('qrcode.qrCodeDetected'),
                  `Found QR code in image: ${result.scannedData.data.substring(0, 30)}${result.scannedData.data.length > 30 ? '...' : ''}`,
                  [{ text: i18n.t('common.close') }]
                );
              }
            }
          }
        },
        {
          text: i18n.t('qrcode.cancel'),
          style: 'cancel'
        }
      ]
    );
  };

  // Custom handler for barcode scanning
  const onBarcodeScanned = (scanResult: { type: string; data: string }) => {
    const result = handleBarCodeScanned(scanResult);
    if (result) {
      setData(result.data);
      
      // Auto-generate title if empty
      if (!title) {
        setTitle(`Scanned QR Code ${new Date().toLocaleTimeString()}`);
      }

      // Show success message with option to view generated QR code
      Alert.alert(
        i18n.t('qrcode.qrCodeScanned'),
        `Successfully scanned QR code: ${result.data.substring(0, 30)}${result.data.length > 30 ? '...' : ''}`,
        [
          { 
            text: i18n.t('common.close'),
            onPress: () => {
              // Set showQRCode to true to display the generated QR code
              setShowQRCode(true);
            }
          }
        ]
      );
    }
  };

  // QR Code Scanner View
  if (scannerVisible) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerVisible}
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerContainer}>
          {cameraPermission ? (
            <View style={styles.cameraWrapper}>
              <CameraView
                style={styles.camera}
                onBarcodeScanned={hasScanned ? undefined : onBarcodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr']
                }}
                ratio="1:1"
              />
            </View>
          ) : (
            <View style={styles.noCameraContainer}>
              <Text style={styles.noCameraText}>{i18n.t('qrcode.cameraPermission')}</Text>
            </View>
          )}
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerTargetBox} />
          </View>
          
          <View style={styles.scannerControls}>
            <TouchableOpacity 
              style={styles.scannerCloseButton}
              onPress={closeScanner}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            
            {hasScanned && (
              <TouchableOpacity 
                style={styles.scannerRescanButton}
                onPress={resetScanner}
              >
                <Text style={styles.scannerRescanText}>{i18n.t('qrcode.scanAgain')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <Animated.View 
          style={[
            styles.modalView,
            { transform: [{ translateY: pan.y }] }
          ]}
        >
          {/* White header with drag handle */}
          <View style={styles.headerContainer} {...panResponder.panHandlers}>
            {/* Manual tour button */}
            {!tourVisible && (
              <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
                <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.tourButtonText}>{i18n.t('common.tourGuide')}</Text>
              </TouchableOpacity>
            )}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('qrcode.modalTitle')}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            {/* Form Fields */}
            <CopilotStep
              text="Enter a title for your QR code"
              order={1}
              name="title-field"
            >
              <WalkthroughableView style={styles.enhancedHighlight}>
                <View style={styles.formField}>
                  <Text style={styles.label}>{i18n.t('qrcode.titleField')} <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    placeholder={i18n.t('qrcode.enterTitle')}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </WalkthroughableView>
            </CopilotStep>

            <CopilotStep
              text="Add a description for your QR code"
              order={2}
              name="description-field"
            >
              <WalkthroughableView style={styles.enhancedHighlight}>
                <View style={styles.formField}>
                  <Text style={styles.label}>{i18n.t('qrcode.descriptionField')}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={i18n.t('qrcode.enterDescription')}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>
              </WalkthroughableView>
            </CopilotStep>

            <CopilotStep
              text="Scan a QR code or pick an image containing a QR code"
              order={3}
              name="qr-picker"
            >
              <WalkthroughableView style={styles.enhancedHighlight}>
                <View style={styles.formField}>
                  <Text style={styles.label}>{i18n.t('qrcode.pickImage')} <Text style={styles.required}>*</Text></Text>
                  <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
                  
                    {!data ? (
                      <>
                        <Ionicons name="image-outline" size={48} color="#777" />
                        <Text style={styles.imagePickerText}>{i18n.t('qrcode.pickQrCodeImage')}</Text>
                      </>
                    ) : (
                      <View style={styles.qrCodeWrapper}>
                        <QRCodeSVG
                          value={data}
                          size={130}
                          color="black"
                          backgroundColor="white"
                        />
                    </View>
                    )}
                  </TouchableOpacity>
                </View>
              </WalkthroughableView>
            </CopilotStep>

            {/* Save Button */}
            <CopilotStep
              text="Save your QR code to your collection"
              order={4}
              name="save-button"
            >
              <WalkthroughableView style={styles.enhancedHighlight}>
                <View style={styles.buttonContainer}>
                  <Button 
                    title={i18n.t('qrcode.save')}
                    onPress={handleSave} 
                    disabled={!title.trim() || !data}
                    style={(!title.trim() || !data) ? styles.disabledButton : styles.button}
                  />
                </View>
              </WalkthroughableView>
            </CopilotStep>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Wrap content with CopilotProvider
const AddQRCodeModal: React.FC<AddQRCodeModalProps> = (props) => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('common.skip'),
        previous: i18n.t('common.previous'),
        next: i18n.t('common.next'),
        finish: i18n.t('common.done')
      }}
      androidStatusBarVisible={true}
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
    >
      <AddQRCodeModalContent {...props} />
    </CopilotProvider>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#DDDDDD',
    borderRadius: 3,
  },
  modalView: {
    backgroundColor: '#FFF7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalViewWithKeyboard: {
    // Adjust height when keyboard is visible
    height: Platform.OS === 'ios' ? height * 0.5 : height * 0.5,
  },
  scrollView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  required: {
    color: '#D91A1A',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    marginTop: 8,
  },
  imagePickerText: {
    marginTop: 8,
    color: '#777',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 20,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  camera: {
    width: Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.9,
    height: Math.min(Dimensions.get('window').width, Dimensions.get('window').height) * 0.9,
    aspectRatio: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerTargetBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 16,
  },
  scannerControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scannerCloseButton: {
    padding: 10,
  },
  scannerRescanButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  scannerRescanText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noCameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCameraText: {
    color: 'white',
    fontSize: 18,
  },
  qrCodeContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  qrCodeWrapper: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.25,
    //shadowRadius: 3.84,
    //elevation: 5,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#AE1913',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
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
    top: 10,
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
  enhancedHighlight: {
    width: '100%',
    borderRadius: 8,
    overflow: 'visible',
    backgroundColor: 'transparent',
    padding: 2,
    marginBottom: 0,
    zIndex: 100,
  },
});

export default AddQRCodeModal;