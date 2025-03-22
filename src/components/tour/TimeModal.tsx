import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface TimeModalProps {
  visible: boolean;
  onClose: () => void;
  timeText: string;
  onTimeChange: (text: string) => void;
  onSave: () => void;
}

const TimeModal: React.FC<TimeModalProps> = ({ 
  visible, 
  onClose, 
  timeText, 
  onTimeChange, 
  onSave 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set Time</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#E53935" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Time Slot:</Text>
            <TextInput 
              style={styles.modalInput}
              value={timeText}
              onChangeText={onTimeChange}
              placeholder="e.g. From 3 PM to 6PM"
            />
            
            <View style={styles.quickOptions}>
              <TouchableOpacity 
                style={styles.quickOption}
                onPress={() => onTimeChange('Morning')}
              >
                <Text style={styles.quickOptionText}>Morning</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickOption}
                onPress={() => onTimeChange('Afternoon')}
              >
                <Text style={styles.quickOptionText}>Afternoon</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickOption}
                onPress={() => onTimeChange('Evening')}
              >
                <Text style={styles.quickOptionText}>Evening</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={onSave}
            >
              <Text style={styles.modalSaveText}>Save</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickOption: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  quickOptionText: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalSaveButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#E53935',
    fontWeight: '500',
  },
});

export default TimeModal; 