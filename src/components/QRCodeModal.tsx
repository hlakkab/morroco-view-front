import { Ionicons } from '@expo/vector-icons';
import * as Brightness from 'expo-brightness';
import React from 'react';
import {
  Animated,
  Dimensions,
  ImageSourcePropType,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';

// Replace with your actual QR code component or image
import QRCodeImageSvg from '../assets/serviceIcons/qrcode-icon.svg';

interface QRCodeModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  // Optional custom content to display instead of default QR code
  data: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  title,
  onClose,
  data
}) => {
  // Create animated value for drag gesture
  const pan = React.useRef(new Animated.ValueXY()).current;
  const originalBrightness = React.useRef<number | null>(null);

  // Function to request brightness permissions and store original brightness
  const setupBrightness = async () => {
    try {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        originalBrightness.current = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1); // Set to maximum brightness
      }
    } catch (error) {
      console.error('Error setting up brightness:', error);
    }
  };

  // Function to restore original brightness
  const restoreBrightness = async () => {
    try {
      if (originalBrightness.current !== null) {
        await Brightness.setBrightnessAsync(originalBrightness.current);
      }
    } catch (error) {
      console.error('Error restoring brightness:', error);
    }
  };

  // Handle brightness when modal visibility changes
  React.useEffect(() => {
    if (visible) {
      console.log('visible');
      setupBrightness();
    } else {
      restoreBrightness();
    }
  }, [visible]);

  // Create pan responder for drag to dismiss
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // If dragged down more than 100 units, close the modal
          onClose();
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

  // Reset pan when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible, pan]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
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
              <View style={styles.titleContainer}>
                <Text style={styles.modalTitle} numberOfLines={1} ellipsizeMode="tail">
                  {title}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalContent}>
            {data ? <QRCodeSVG
              value={data}
              size={200}
              color="black"
              backgroundColor="transparent"
              logo={require('../assets/img/morroco-view-logo.svg')}
            /> 
            : <QRCodeImageSvg width={width * 0.8} height={width * 0.8} />}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  headerContainer: {
    backgroundColor: 'white',
    width: '100%',
    paddingTop: 12,
    paddingBottom: 12,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  dragHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#D3D3D3',
    borderRadius: 2.5,
  },
  modalView: {
    backgroundColor: '#FFF7F7',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    height: height * 0.6, // Take up 60% of screen height
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
});

export default QRCodeModal;