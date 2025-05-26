import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import { AppDispatch } from '../store';
import { createEsim } from '../store/slices/esimSlice';

// SVG imports for different providers
import InwiSvg from '../assets/serviceIcons/inwi-img.svg';
import OrangeSvg from '../assets/serviceIcons/orange-img.svg';
import i18n from '../translations/i18n';

const TOUR_FLAG = '@buyEsimModalTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

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
  onBuy: (operatorId: string, price: number, offer?: string) => void | Promise<void>;
}

const BuyESIMModalContent: React.FC<BuyESIMModalProps> = ({ 
  visible, 
  onClose,
  onBuy
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { start: startTour, copilotEvents, visible: tourVisible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(TOUR_FLAG)
        .then(value => {
          console.log('Buy ESIM Tour seen status:', value);
          setHasSeenTour(value === 'true');
        })
        .catch(error => {
          console.error('Error reading Buy ESIM tour status:', error);
          setHasSeenTour(false);
        });
    }
  }, [visible]);

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      visible,
      tourStarted,
      tourVisible
    });

    if (visible && hasSeenTour === false && !tourStarted && !tourVisible) {
      console.log('Starting Buy ESIM tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visible, hasSeenTour, tourStarted, tourVisible, startTour]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      console.log('Buy ESIM Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Buy ESIM Tour status saved successfully');
      } catch (error) {
        console.error('Error saving Buy ESIM tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      console.log('Step changed to:', step);
    };

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
    startTour();
  };

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

  const handleBuy = async () => {
    if (selectedOperator && selectedOffer) {
      try {
        const selectedOfferData = offers.find(offer => offer.id === selectedOffer);
        if (selectedOfferData) {
          const price = parseFloat(selectedOfferData.price);
          await onBuy(selectedOperator, price, selectedOfferData.data);
          handleClose();
        }
      } catch (error) {
        console.error('Error creating ESIM:', error);
        // You might want to show an error message to the user here
      }
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
              <View style={styles.headerRightContainer}>
                {/* Manual tour button - custom positioned for this modal */}
                {!tourVisible && (
                  <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
                    <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={16} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.modalContent}>
            

            {/* Operator Selection */}
            <View style={styles.formField}>
              <CopilotStep
                text={i18n.t('copilot.esim.selectOperator')}
                order={1}
                name="operator-selection"
              >
                <WalkthroughableView style={styles.enhancedHighlight}>
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
                </WalkthroughableView>
              </CopilotStep>
            </View>

            {/* Offers Selection */}
            <View style={styles.formField}>
              <CopilotStep
                text={i18n.t('copilot.esim.selectOffer')}
                order={2}
                name="offer-selection"
              >
                <WalkthroughableView style={styles.enhancedHighlight}>
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
                </WalkthroughableView>
              </CopilotStep>
            </View>

            {/* Buy Button */}
            <View style={styles.buttonContainer}>
              <CopilotStep
                text={i18n.t('copilot.esim.confirmPurchase')}
                order={3}
                name="confirm-purchase"
              >
                <WalkthroughableView style={styles.enhancedHighlight}>
                  <Button 
                    title={`${i18n.t('qrcode.buyFor')} ${(() => {
                      const offerPrice = offers.find(o => o.id === selectedOffer)?.price;
                      if (offerPrice) {
                        return Math.round(parseFloat(offerPrice)) + '€';
                      }
                      return '0€';
                    })()}`} 
                    onPress={handleBuy}
                    disabled={!selectedOperator || !selectedOffer}
                  />
                </WalkthroughableView>
              </CopilotStep>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const BuyESIMModal: React.FC<BuyESIMModalProps> = (props) => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('copilot.navigation.skip'),
        previous: i18n.t('copilot.navigation.previous'),
        next: i18n.t('copilot.navigation.next'),
        finish: i18n.t('copilot.navigation.finish')
      }}
      androidStatusBarVisible={true} 
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
    >
      <BuyESIMModalContent {...props} />
    </CopilotProvider>
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 10,
  },
  modalContent: {
    marginTop: 15,
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 0,
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
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  walkthroughContainer: {
    width: '100%',
    position: 'relative',
  },
  operatorHighlight: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  offerHighlight: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buyButtonHighlight: {
    width: '100%',
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  formField: {
    marginBottom: 20,
    width: '100%',
    borderRadius: 8,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
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

export default BuyESIMModal;