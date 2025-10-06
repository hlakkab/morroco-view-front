import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import i18n from '../../translations/i18n';
import Button from '../Button';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string, otherReason?: string) => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteReasons = [
    { id: 'privacy', label: i18n.t('account.deleteReasons.privacy') },
    { id: 'notUsing', label: i18n.t('account.deleteReasons.notUsing') },
    { id: 'foundAlternative', label: i18n.t('account.deleteReasons.foundAlternative') },
    { id: 'technicalIssues', label: i18n.t('account.deleteReasons.technicalIssues') },
    { id: 'other', label: i18n.t('account.deleteReasons.other') },
  ];

  const handleReasonSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
    setShowOtherInput(reasonId === 'other');
  };

  const handleConfirm = async () => {
    if (!selectedReason) {
      return;
    }
    setIsDeleting(true);
    try {
      await onConfirm(selectedReason, showOtherInput ? otherReason : undefined);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{i18n.t('account.deleteAccount')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>
            {i18n.t('account.deleteAccountDescription')}
          </Text>

          <View style={styles.reasonsContainer}>
            {deleteReasons.map((reason) => (
              <TouchableOpacity
                key={reason.id}
                style={[
                  styles.reasonItem,
                  selectedReason === reason.id && styles.selectedReason
                ]}
                onPress={() => handleReasonSelect(reason.id)}
              >
                <Ionicons
                  name={selectedReason === reason.id ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedReason === reason.id ? '#CE1126' : '#666'}
                />
                <Text style={[
                  styles.reasonText,
                  selectedReason === reason.id && styles.selectedReasonText
                ]}>
                  {reason.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {showOtherInput && (
            <TextInput
              style={styles.otherReasonInput}
              placeholder={i18n.t('account.enterOtherReason')}
              value={otherReason}
              onChangeText={setOtherReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              title={i18n.t('account.cancel')}
              style={[styles.cancelButton, { backgroundColor: '#BBB' }]}
              onPress={onClose}
            />
            <Button
              title={i18n.t('account.confirmDelete')}
              style={styles.deleteButton}
              onPress={handleConfirm}
              loading={isDeleting}
              disabled={isDeleting}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF7F7',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  selectedReason: {
    backgroundColor: 'rgba(206, 17, 38, 0.1)',
  },
  reasonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  selectedReasonText: {
    color: '#CE1126',
    fontWeight: '500',
  },
  otherReasonInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  cancelButtonText: {
    color: '#CE1126',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#CE1126',
  },
});

export default DeleteAccountModal; 