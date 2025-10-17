import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../translations/i18n';

interface DeleteTourConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tourTitle: string;
}

const DeleteTourConfirmationModal: React.FC<DeleteTourConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  tourTitle,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.iconContainer}>
            <Feather name="trash-2" size={40} color="#FF4C4C" />
          </View>
          
          <Text style={styles.title}>{i18n.t('tours.deleteTour')}</Text>
          
          <Text style={styles.message}>
            {i18n.t('tours.deleteTourConfirmation').replace('{title}', tourTitle)}
          </Text>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{i18n.t('common.cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={onConfirm}
            >
              <Feather name="trash" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.deleteButtonText}>{i18n.t('tours.delete')}</Text>
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
    padding: 24,
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
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 50,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF4C4C',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default DeleteTourConfirmationModal; 