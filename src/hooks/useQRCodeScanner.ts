import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import QRCode from '../model/qrcode';

/**
 * Custom hook to handle QR code scanning and image picking
 */
export const useQRCodeScanner = (onScanSuccess: (data: QRCode) => void) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  /**
   * Handle barcode scanning result
   */
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Create QR code data object
      const qrCodeData: QRCode = {
        id: Date.now().toString(),
        data,
        createdAt: new Date().toISOString(),
        title: `Scanned QR Code ${new Date().toLocaleTimeString()}`,
        description: `Content: ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`
      };
      
      // Call the success callback
      onScanSuccess(qrCodeData);
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Take a picture with the camera and scan for QR codes
   */
  const takePictureWithCamera = async () => {
    try {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take pictures');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      
      // Scan the image for QR codes
      const scannedResults = await Camera.scanFromURLAsync(result.assets[0].uri);
      
      if (scannedResults.length > 0) {
        // Process the first QR code found
        handleBarCodeScanned({
          type: scannedResults[0].type,
          data: scannedResults[0].data
        });
      } else {
        Alert.alert('No QR Code Found', 'No QR code was detected in the image');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  /**
   * Pick an image from the gallery and scan for QR codes
   */
  const pickImageFromGallery = async () => {
    try {
      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to pick images');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      
      // Scan the image for QR codes
      const scannedResults = await Camera.scanFromURLAsync(result.assets[0].uri);
      
      if (scannedResults.length > 0) {
        // Process the first QR code found
        handleBarCodeScanned({
          type: scannedResults[0].type,
          data: scannedResults[0].data
        });
      } else {
        Alert.alert('No QR Code Found', 'No QR code was detected in the image');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  return {
    isProcessing,
    handleBarCodeScanned,
    takePictureWithCamera,
    pickImageFromGallery
  };
}; 