import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  PanResponder,
  TextInput,
  Keyboard,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { CameraView } from 'expo-camera';
import { useCamera } from '../hooks/useCamera';
import QRCode from '../model/qrcode';
import * as BarCodeScanner from 'expo-barcode-scanner';
import QRCodeSVG from 'react-native-qrcode-svg';

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

const AddQRCodeModal: React.FC<AddQRCodeModalProps> = ({ 
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
      'Select Option',
      'Choose how to add a QR code',
      [
        {
          text: 'Scan QR Code',
          onPress: handleOpenScanner
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await pickImageFromGallery();
            if (result) {
              setImageUri(result.imageUri);
              if (result.scannedData) {
                setData(result.scannedData.data);
                
                // Show confirmation dialog
                Alert.alert(
                  'QR Code Detected',
                  `Found QR code in image: ${result.scannedData.data.substring(0, 30)}${result.scannedData.data.length > 30 ? '...' : ''}`,
                  [{ text: 'OK' }]
                );
              }
            }
          }
        },
        {
          text: 'Cancel',
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
        'QR Code Scanned',
        `Successfully scanned QR code: ${result.data.substring(0, 30)}${result.data.length > 30 ? '...' : ''}`,
        [
          { 
            text: 'OK',
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
              <Text style={styles.noCameraText}>Camera permission not granted</Text>
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
                <Text style={styles.scannerRescanText}>Scan Again</Text>
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
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add QR Code</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            {/* Form Fields */}
            <View style={styles.formField}>
              <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.label}>Pick QR Code image <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
               
                {!data ? (
                  <>
                    <Ionicons name="image-outline" size={48} color="#777" />
                    <Text style={styles.imagePickerText}>Pick QR Code image</Text>
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

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <Button 
                title="Save" 
                onPress={handleSave} 
                disabled={!title.trim() || !data}
                style={(!title.trim() || !data) ? styles.disabledButton : styles.button}
              />
            </View>

          </View>
        </Animated.View>
      </View>
    </Modal>
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
});

export default AddQRCodeModal;