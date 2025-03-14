import React, { useState } from 'react';
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
import Button from '../components/Button';

// SVG imports for different providers
import InwiSvg from '../assets/serviceIcons/inwi-img.svg';
import OrangeSvg from '../assets/serviceIcons/orange-img.svg';

interface OperatorOption {
  id: string;
  name: string;
  logo: React.ReactNode;
  price: string;
}

interface BuyESIMModalProps {
  visible: boolean;
  onClose: () => void;
  onBuy: (operatorId: string) => void;
}

const BuyESIMModal: React.FC<BuyESIMModalProps> = ({ 
  visible, 
  onClose,
  onBuy
}) => {
  // Available operators
  const operators: OperatorOption[] = [
    {
      id: 'inwi',
      name: 'eSim Inwi',
      logo: <InwiSvg width={50} height={35} />,
      price: '20DH'
    },
    {
      id: 'orange',
      name: 'eSim Orange',
      logo: <OrangeSvg width={50} height={35} />,
      price: '25DH'
    }
  ];

  // Selected operator
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  // Create animated value for drag gesture
  const pan = React.useRef(new Animated.ValueXY()).current;
  
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

  // Reset pan and selection when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: 0 });
      // Default to first operator selected
      if (operators.length > 0 && !selectedOperator) {
        setSelectedOperator(operators[0].id);
      }
    }
  }, [visible, pan, operators, selectedOperator]);

  const handleClose = () => {
    onClose();
  };

  const handleSelectOperator = (operatorId: string) => {
    setSelectedOperator(operatorId);
  };

  const handleBuy = () => {
    if (selectedOperator) {
      const selectedOp = operators.find(op => op.id === selectedOperator);
      onBuy(selectedOperator);
      handleClose();
    }
  };

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
              <Text style={styles.modalTitle}>Buy New eSIm</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            {/* Operator Selection */}
            <View style={styles.formField}>
              <Text style={styles.label}>Select Operator <Text style={styles.required}>*</Text></Text>
              
              <View style={styles.operatorList}>
                {operators.map(operator => (
                  <TouchableOpacity 
                    key={operator.id}
                    style={[
                      styles.operatorOption,
                      selectedOperator === operator.id && styles.operatorOptionSelected
                    ]}
                    onPress={() => handleSelectOperator(operator.id)}
                  >
                    <View style={styles.operatorInfo}>
                      {operator.logo}
                      <Text style={styles.operatorName}>{operator.name}</Text>
                    </View>
                    
                    {selectedOperator === operator.id && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#D91A1A" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buy Button */}
            <View style={styles.buttonContainer}>
              {selectedOperator && (
                <Button 
                  title={`Buy for ${operators.find(op => op.id === selectedOperator)?.price}`} 
                  onPress={handleBuy} 
                />
              )}
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
    height: height * 0.6,
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
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  required: {
    color: '#D91A1A',
  },
  operatorList: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden'
  },
  operatorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  operatorOptionSelected: {
    backgroundColor: 'rgba(217, 26, 26, 0.07)'
  },
  operatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  operatorName: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500'
  },
  checkmarkContainer: {
    marginLeft: 10
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingVertical: 20,
  }
});

export default BuyESIMModal;