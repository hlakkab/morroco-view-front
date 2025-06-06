import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { RootStackParamList } from '../navigation/AppNavigator';
import i18n from '../translations/i18n';

const TOUR_FLAG = '@moneyExchangeTourSeen';

// Define a type for currency codes
type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF';

// Update currency interface
interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);
const WalkthroughableScrollView = walkthroughable(ScrollView);
const WalkthroughableTouchableOpacity = walkthroughable(TouchableOpacity);

// Define currencies with the new type
const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
];

// Define exchange rates with proper typing
const EXCHANGE_RATES: Record<CurrencyCode, { airport: number; bank: number; broker: number }> = {
  USD: { airport: 9.8, bank: 9.9, broker: 10.5 },
  EUR: { airport: 10.7, bank: 10.8, broker: 11.5 },
  GBP: { airport: 12.5, bank: 12.6, broker: 13.4 },
  CAD: { airport: 7.2, bank: 7.3, broker: 7.8 },
  AUD: { airport: 6.5, bank: 6.6, broker: 7.0 },
  JPY: { airport: 0.068, bank: 0.069, broker: 0.073 },
  CHF: { airport: 11.2, bank: 11.3, broker: 12.0 },
};

// Main content component with copilot functionality
const MoneyExchangeScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [amount, setAmount] = useState('100');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [exchangeResults, setExchangeResults] = useState({
    airport: 0,
    bank: 0,
    broker: 0,
    savings: 0,
    savingsPercentage: 0,
  });

  const { start: startTour, copilotEvents, visible: tourVisible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const filteredText = text.replace(/[^0-9.]/g, '');
    setAmount(filteredText);
  };

  const handleCurrencySelect = (currency: typeof CURRENCIES[0]) => {
    setSelectedCurrency(currency);
    setShowCurrencyPicker(false);
  };

  const handleViewBrokers = () => {
    navigation.navigate('BrokerList');
  };

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
      tourStarted,
      tourVisible
    });

    if (hasSeenTour === false && !tourStarted && !tourVisible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, tourVisible]);

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
    // Reset scroll position when starting the tour
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Calculate exchange rates whenever amount or currency changes
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) {
      setExchangeResults({
        airport: 0,
        bank: 0,
        broker: 0,
        savings: 0,
        savingsPercentage: 0,
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    const rates = EXCHANGE_RATES[selectedCurrency.code];
    
    const airportResult = numericAmount * rates.airport;
    const bankResult = numericAmount * rates.bank;
    const brokerResult = numericAmount * rates.broker;
    
    // Calculate savings compared to airport (usually the worst rate)
    const savings = brokerResult - airportResult;
    const savingsPercentage = (savings / airportResult) * 100;

    setExchangeResults({
      airport: airportResult,
      bank: bankResult,
      broker: brokerResult,
      savings,
      savingsPercentage,
    });
  }, [amount, selectedCurrency]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('exchange.title')} 
          onBack={handleBack} 
          showTour={!tourVisible}
          onTourPress={handleStartTour}
        />
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        scrollEnabled={!tourVisible} // Disable scrolling during tour
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Currency Converter Section */}
          <CopilotStep
            text={i18n.t('copilot.moneyExchange.currencyConverter')}
            order={1}
            name="currency-converter"
          >
            <WalkthroughableView style={styles.converterCard}>
              <Text style={styles.converterTitle}>{i18n.t('exchange.converter')}</Text>
              
              <View style={styles.inputContainer}>
                <View style={styles.amountContainer}>
                  <Text style={styles.inputLabel}>{i18n.t('exchange.amount')}</Text>
                  <View style={styles.amountInputWrapper}>
                    <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      placeholder={i18n.t('exchange.amount')}
                    />
                  </View>
                </View>
                
                <View style={styles.currencyContainer}>
                  <Text style={styles.inputLabel}>{i18n.t('exchange.currency')}</Text>
                  <TouchableOpacity 
                    style={styles.currencySelector}
                    onPress={() => setShowCurrencyPicker(true)}
                  >
                    <Text style={styles.currencyFlag}>{selectedCurrency.flag}</Text>
                    <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>{i18n.t('exchange.youllGet')}</Text>
                <Text style={styles.resultValue}>
                  {exchangeResults.broker.toFixed(2)} <Text style={styles.madText}>MAD</Text>
                </Text>
                <Text style={styles.resultNote}>
                  {i18n.t('exchange.ratesDisclaimer')}
                </Text>
              </View>
            </WalkthroughableView>
          </CopilotStep>
          
          <Text style={styles.sectionTitle}>{i18n.t('exchange.compareOptions')}</Text>
          
          <View style={styles.optionsContainer}>
            {/* Airport Exchange Option */}
            <CopilotStep
              text={i18n.t('copilot.moneyExchange.airportOption')}
              order={2}
              name="airport-option"
            >
              <WalkthroughableView style={styles.exchangeOption}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="airplane" size={20} color="#fff" />
                  </View>
                  <Text style={styles.optionTitle}>{i18n.t('exchange.airport')}</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionRate}>{i18n.t('exchange.rate')} {EXCHANGE_RATES[selectedCurrency.code].airport.toFixed(2)} MAD</Text>
                  <Text style={styles.optionAmount}>
                    {i18n.t('exchange.youGet')} <Text style={styles.optionAmountValue}>{exchangeResults.airport.toFixed(2)} MAD</Text>
                  </Text>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>{i18n.t('exchange.airportBadge')}</Text>
                  </View>
                </View>
              </WalkthroughableView>
            </CopilotStep>
            
            {/* Bank Exchange Option */}
            <CopilotStep
              text={i18n.t('copilot.moneyExchange.bankOption')}
              order={3}
              name="bank-option"
            >
              <WalkthroughableView style={styles.exchangeOption}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionIconContainer}>
                    <Ionicons name="business" size={20} color="#fff" />
                  </View>
                  <Text style={styles.optionTitle}>{i18n.t('exchange.bank')}</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionRate}>{i18n.t('exchange.rate')} {EXCHANGE_RATES[selectedCurrency.code].bank.toFixed(2)} MAD</Text>
                  <Text style={styles.optionAmount}>
                    {i18n.t('exchange.youGet')} <Text style={styles.optionAmountValue}>{exchangeResults.bank.toFixed(2)} MAD</Text>
                  </Text>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>{i18n.t('exchange.bankBadge')}</Text>
                  </View>
                </View>
              </WalkthroughableView>
            </CopilotStep>
            
            {/* Broker Exchange Option - Highlighted */}
            <CopilotStep
              text={i18n.t('copilot.moneyExchange.brokerOption')}
              order={4}
              name="broker-option"
            >
              <WalkthroughableView style={styles.exchangeOptionHighlighted}>
                <View style={styles.bestDealBadge}>
                  <Text style={styles.bestDealText}>{i18n.t('exchange.bestDeal')}</Text>
                </View>
                
                <View style={styles.optionHeader}>
                  <View style={[styles.optionIconContainer, styles.brokerIconContainer]}>
                    <Ionicons name="cash-outline" size={20} color="#fff" />
                  </View>
                  <Text style={styles.optionTitle}>{i18n.t('exchange.broker')}</Text>
                </View>
                
                <View style={styles.optionContent}>
                  <Text style={styles.optionRate}>{i18n.t('exchange.rate')} {EXCHANGE_RATES[selectedCurrency.code].broker.toFixed(2)} MAD</Text>
                  <Text style={styles.optionAmount}>
                    {i18n.t('exchange.youGet')} <Text style={styles.optionAmountHighlightedValue}>{exchangeResults.broker.toFixed(2)} MAD</Text>
                  </Text>
                  
                  <View style={styles.savingsContainer}>
                    <Ionicons name="trending-up" size={18} color="#008060" />
                    <View style={styles.savingsTextContainer}>
                      <Text style={styles.savingsText}>
                        {i18n.t('exchange.saveComparedTo').replace('{percent}', exchangeResults.savingsPercentage.toFixed(1))}
                      </Text>
                      <Text style={styles.savingsText}>
                        {i18n.t('exchange.moreInPocket').replace('{amount}', exchangeResults.savings.toFixed(2))}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.brokerBenefits}>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#008060" />
                      <Text style={styles.benefitText}>{i18n.t('exchange.brokerBenefit1')}</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#008060" />
                      <Text style={styles.benefitText}>{i18n.t('exchange.brokerBenefit2')}</Text>
                    </View>
                    <View style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#008060" />
                      <Text style={styles.benefitText}>{i18n.t('exchange.brokerBenefit3')}</Text>
                    </View>
                  </View>
                  
                  <CopilotStep
                    text={i18n.t('copilot.findBrokers')}
                    order={5}
                    name="view-brokers"
                  >
                    <WalkthroughableTouchableOpacity onPress={handleViewBrokers}>
                      <Button 
                        title={i18n.t('exchange.viewBrokers')}
                        icon={<Ionicons name="location" size={18} color="#fff" style={{ marginRight: 8 }} />}
                        style={styles.brokerButton}
                        onPress={handleViewBrokers}
                      />
                    </WalkthroughableTouchableOpacity>
                  </CopilotStep>
                </View>
              </WalkthroughableView>
            </CopilotStep>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showCurrencyPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCurrencyPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{i18n.t('exchange.selectCurrency')}</Text>
                  <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.currencyScrollView}>
                  {CURRENCIES.map((currency) => (
                    <TouchableOpacity
                      key={currency.code}
                      style={[
                        styles.currencyOption,
                        selectedCurrency.code === currency.code && styles.selectedCurrencyOption
                      ]}
                      onPress={() => {
                        handleCurrencySelect(currency);
                        setShowCurrencyPicker(false);
                      }}
                    >
                      <Text style={styles.currencyFlag}>{currency.flag}</Text>
                      <Text style={styles.currencyName}>{currency.name}</Text>
                      <Text style={styles.currencyCodeSmall}>{currency.code}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const MoneyExchangeScreen: React.FC = () => {
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
      arrowSize={8}
      arrowColor="#FFF7F7"
    >
      <MoneyExchangeScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40, // Add extra padding at the bottom to ensure visibility during tour
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
  },
  converterCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  converterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  amountContainer: {
    flex: 2,
    marginRight: 8,
  },
  currencyContainer: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#f9f9f9',
  },
  currencyFlag: {
    fontSize: 18,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  resultContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  madText: {
    color: '#CE1126',
  },
  resultNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  exchangeOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  exchangeOptionHighlighted: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#008060',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#008060',
    overflow: 'hidden',
    position: 'relative',
  },
  bestDealBadge: {
    position: 'absolute',
    top: 12,
    right: 0,
    backgroundColor: '#008060',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 1,
  },
  bestDealText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brokerIconContainer: {
    backgroundColor: '#008060',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionContent: {
    padding: 16,
  },
  optionRate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  optionAmount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  optionAmountValue: {
    fontWeight: '600',
    color: '#333',
  },
  optionAmountHighlightedValue: {
    fontWeight: '700',
    color: '#008060',
    fontSize: 16,
  },
  optionBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  optionBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  savingsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  savingsText: {
    fontSize: 14,
    color: '#333',
  },
  savingsValue: {
    fontWeight: '700',
    color: '#008060',
  },
  brokerBenefits: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  brokerButton: {
    backgroundColor: '#008060',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  currencyScrollView: {
    maxHeight: 300,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCurrencyOption: {
    backgroundColor: '#f0f8ff',
  },
  currencyName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  currencyCodeSmall: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
    top: 50,
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
});

export default MoneyExchangeScreen; 