import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';

interface CreditCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (cardData: CreditCardData) => void;
}

export interface CreditCardData {
  cardNumber: string;
  cardHolder: string;
  cvv: string;
  expiryMonth: string;
  expiryYear: string;
}

interface CreditCardFormData {
  cardNumber: string;
  cardHolder: string;
  cvv: string;
  expiryDate: string; // Format: MM/YY
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const [cardData, setCardData] = useState<CreditCardFormData>({
    cardNumber: '',
    cardHolder: '',
    cvv: '',
    expiryDate: ''
  });

  const formatCardNumber = (text: string) => {
    // Remove all spaces and non-digits
    const cleaned = text.replace(/\s+/g, '').replace(/\D/g, '');
    
    // Add space every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Add "/" after 2 digits (MM/YY)
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardData({ ...cardData, cardNumber: formatted });
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setCardData({ ...cardData, expiryDate: formatted });
  };

  const handleSubmit = () => {
    // Remove spaces from card number before validation and submission
    const cleanCardNumber = cardData.cardNumber.replace(/\s+/g, '');
    
    // Parse expiry date (MM/YY format)
    const [month, year] = cardData.expiryDate.split('/');
    const fullYear = year ? '20' + year : '';
    
    if (!cleanCardNumber || !cardData.cardHolder || !cardData.cvv || !month || !year) {
      Alert.alert('Incomplete Data', 'Please fill all credit card fields');
      return;
    }

    // Submit with cleaned and parsed data
    onSubmit({
      cardNumber: cleanCardNumber,
      cardHolder: cardData.cardHolder,
      cvv: cardData.cvv,
      expiryMonth: month,
      expiryYear: fullYear
    });
    
    // Reset form
    setCardData({
      cardNumber: '',
      cardHolder: '',
      cvv: '',
      expiryDate: ''
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setCardData({
      cardNumber: '',
      cardHolder: '',
      cvv: '',
      expiryDate: ''
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.backdrop} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Enter Card Details</Text>
          <Text style={styles.modalSubtitle}>Fill in your credit card information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#999999"
              keyboardType="numeric"
              maxLength={19}
              value={cardData.cardNumber}
              onChangeText={handleCardNumberChange}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999999"
              autoCapitalize="words"
              value={cardData.cardHolder}
              onChangeText={(text) => setCardData({ ...cardData, cardHolder: text })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                value={cardData.cvv}
                onChangeText={(text) => setCardData({ ...cardData, cvv: text })}
              />
            </View>

            <View style={styles.spacer} />

            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                placeholderTextColor="#999999"
                keyboardType="numeric"
                maxLength={5}
                value={cardData.expiryDate}
                onChangeText={handleExpiryDateChange}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: '#1A1A1A'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  flex1: {
    flex: 1
  },
  spacer: {
    width: 12
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666'
  },
  submitButton: {
    backgroundColor: '#D32F2F',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
});

export default CreditCardModal;

