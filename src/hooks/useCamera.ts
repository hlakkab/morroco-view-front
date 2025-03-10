import { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Custom hook to handle camera and gallery permissions and QR code scanning
 */
export const useCamera = () => {
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [galleryPermission, setGalleryPermission] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [scannerVisible, setScannerVisible] = useState<boolean>(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  /**
   * Request camera and gallery permissions
   */
  const requestPermissions = async () => {
    // Request gallery permissions
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    setGalleryPermission(galleryStatus === 'granted');
    
    // Request camera permissions
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraStatus === 'granted');
    
    return {
      camera: cameraStatus === 'granted',
      gallery: galleryStatus === 'granted'
    };
  };

  /**
   * Open the QR code scanner
   */
  const openScanner = async () => {
    try {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to scan QR codes');
        return false;
      }
      
      setCameraPermission(true);
      setScannerVisible(true);
      setHasScanned(false);
      return true;
    } catch (error) {
      console.error('Error opening scanner:', error);
      return false;
    }
  };

  /**
   * Close the QR code scanner
   */
  const closeScanner = () => {
    setScannerVisible(false);
  };

  /**
   * Reset the scanner to scan again
   */
  const resetScanner = () => {
    setHasScanned(false);
  };

  /**
   * Handle barcode scanning result
   */
  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (hasScanned) return;
    
    setHasScanned(true);
    setScannedData(data);
    
    // Close scanner
    setScannerVisible(false);
    
    return {
      type,
      data
    };
  };

  /**
   * Scan QR code from an image
   */
  const scanFromImage = async (imageUri: string) => {
    try {
      const scannedResults = await Camera.scanFromURLAsync(imageUri);
      if (scannedResults.length > 0) {
        setScannedData(scannedResults[0].data);
        return {
          type: scannedResults[0].type,
          data: scannedResults[0].data
        };
      }
      return null;
    } catch (error) {
      console.error('Error scanning from image:', error);
      return null;
    }
  };

  /**
   * Take a picture with the camera and scan for QR codes
   */
  const takePictureWithCamera = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take pictures');
        return null;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Try to scan QR code from the image
        const scannedData = await scanFromImage(imageUri);
        
        return {
          imageUri,
          scannedData
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      return null;
    }
  };

  /**
   * Pick an image from the gallery and scan for QR codes
   */
  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Gallery permission is required to pick images');
        return null;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        
        // Try to scan QR code from the image
        const scannedData = await scanFromImage(imageUri);
        
        return {
          imageUri,
          scannedData
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  return {
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
    scanFromImage,
    takePictureWithCamera,
    pickImageFromGallery
  };
}; 