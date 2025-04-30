import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../translations/i18n';

interface EmptyDaysWarningModalProps {
  visible: boolean;
  emptyDays: number[];
  onContinue: () => void;
  onStayAndFill: () => void;
}

const EmptyDaysWarningModal: React.FC<EmptyDaysWarningModalProps> = ({
  visible,
  emptyDays,
  onContinue,
  onStayAndFill,
}) => {
  // Format days for display (Day 1, Day 2, etc.)
  const formattedDays = emptyDays.map(day => `${i18n.t('tours.day')} ${day}`).join(', ');
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.iconContainer}>
            <Feather name="alert-triangle" size={40} color="#FFA000" />
          </View>
          
          <Text style={styles.title}>{i18n.t('tours.incompleteSchedule')}</Text>
          
          <Text style={styles.message}>
            {i18n.t('tours.emptyDaysWarning').replace('{days}', formattedDays)}
          </Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={onContinue}
            >
              <Text style={styles.continueButtonText}>{i18n.t('tours.continue')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.stayButton]}
              onPress={onStayAndFill}
            >
              <Feather name="check-circle" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.stayButtonText}>{i18n.t('tours.stayAndFill')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  continueButton: {
    backgroundColor: '#F5F5F5',
  },
  stayButton: {
    backgroundColor: '#E53935',
  },
  continueButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  stayButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EmptyDaysWarningModal; 