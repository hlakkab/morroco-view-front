import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  PanResponder,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  qrCodeUrl: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ 
  visible, 
  onClose,
  qrCodeUrl
}) => {
  // Create animated value for drag gesture
  const pan = React.useRef(new Animated.ValueXY()).current;
  
  // Create pan responder for drag to dismiss
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], { useNativeDriver: false })(_, gestureState);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          onClose();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false
          }).start();
        }
      }
    })
  ).current;

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
          <View style={styles.headerContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your eSIM QR Code</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.qrCodeContainer}>
              <Image 
                source={{ uri: qrCodeUrl }} 
                style={styles.qrCode}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.instructions}>
              Scan this QR code with your device's camera to install your eSIM
            </Text>
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
    height: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeContainer: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 20,
  },
});

export default QRCodeModal; 