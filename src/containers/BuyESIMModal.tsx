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
import i18n from '../translations/i18n';

interface OperatorOption {
  id: string;
  name: string;
  logo: React.ReactNode;
  price: string;
}

interface Offer {
  id: string;
  data: string;
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
      price: '2€'
    },
    {
      id: 'orange',
      name: 'eSim Orange',
      logo: <OrangeSvg width={50} height={35} />,
      price: '2€'
    }
  ];

  // Available offers
  const offers: Offer[] = [
    { id: '0', data: 'eSIM Only', price: '2' },
    { id: '1', data: '3h + 5GO', price: '5' },
    { id: '2', data: '5h + 10GO', price: '8' },
    { id: '3', data: '10h + 20GO', price: '11' },
    { id: '4', data: '20h + 50GO', price: '14' }
  ];

  // Selected operator and offer
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

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

  const handleSelectOffer = (offerId: string) => {
    setSelectedOffer(offerId);
  };

  const handleBuy = () => {
    if (selectedOperator && selectedOffer) {
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
              <Text style={styles.modalTitle}>{i18n.t('qrcode.buyNew')}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            {/* Operator Selection */}
            <View style={styles.formField}>
              <Text style={styles.label}>{i18n.t('qrcode.selectOperator')} <Text style={styles.required}>*</Text></Text>
              
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

            {/* Offers Selection */}
            <View style={styles.formField}>
              <Text style={styles.label}>Select Offer <Text style={styles.required}>*</Text></Text>
              <View style={styles.offersList}>
                {offers.map((offer) => (
                  <TouchableOpacity
                    key={offer.id}
                    style={[
                      styles.offerOption,
                      selectedOffer === offer.id && styles.offerOptionSelected
                    ]}
                    onPress={() => handleSelectOffer(offer.id)}
                  >
                    <Text style={styles.offerData}>{offer.data}</Text>
                    <View style={styles.offerRightSection}>
                      <Text style={[
                        styles.offerPrice,
                        selectedOffer === offer.id && styles.offerPriceSelected
                      ]}>
                        {`${offer.price}€`}
                      </Text>
                      {selectedOffer === offer.id && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={24} color="#D91A1A" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buy Button */}
            <View style={styles.buttonContainer}>
              {selectedOperator && selectedOffer && (
                <Button 
                  title={`${i18n.t('qrcode.buyFor')} ${(() => {
                    const offerPrice = offers.find(o => o.id === selectedOffer)?.price;
                    if (offerPrice) {
                      return Math.round( parseFloat(offerPrice)) + '€';
                    }
                    return '0€';
                  })()}`} 
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
    height: height * 0.9,
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
    marginTop: 15,
    flex: 1,
    gap: 10,
    width: '100%',
  
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  formField: {
    marginBottom: 0,
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
    paddingVertical: 20,
  },
  offersList: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden'
  },
  offerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  offerOptionSelected: {
    backgroundColor: 'rgba(217, 26, 26, 0.07)'
  },
  offerData: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  offerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  offerPrice: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500'
  },
  offerPriceSelected: {
    color: '#D91A1A'
  },
});

export default BuyESIMModal;