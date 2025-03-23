import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LogBox } from 'react-native';
import ModernDatePicker from 'react-native-modern-datepicker';

// Suppress the specific warning about defaultProps
LogBox.ignoreLogs([
  'Warning: DatePicker: Support for defaultProps will be removed from function components',
  'Warning: Header: Support for defaultProps will be removed from function components'
]);

// Create a wrapper component that doesn't rely on defaultProps
const DatePicker: React.FC<any> = (props) => {
  return (
    <ModernDatePicker {...props} />
  );
};

// Define a type for the picker mode
type DatePickerMode = 'start' | 'end';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  pickerMode: DatePickerMode;
  setPickerMode: (mode: DatePickerMode) => void;
  startDate: string;
  endDate: string;
  onDateSelect: (date: string) => void;
  formatDisplayDate: (dateString: string) => string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  pickerMode,
  setPickerMode,
  startDate,
  endDate,
  onDateSelect,
  formatDisplayDate
}) => {
  // Get minimum date for picker
  const getMinimumDate = () => {
    if (pickerMode === 'start') {
      return new Date().toISOString().split('T')[0].replace(/-/g, '/');
    } else {
      // For end date picker, minimum should be start date if selected, otherwise today
      return startDate || new Date().toISOString().split('T')[0].replace(/-/g, '/');
    }
  };

  // Get current date to show in the picker
  const getCurrentDate = () => {
    if (pickerMode === 'start' && startDate) {
      return startDate;
    } else if (pickerMode === 'end' && endDate) {
      return endDate;
    } else if (pickerMode === 'end' && startDate) {
      return startDate;
    }
    return new Date().toISOString().split('T')[0].replace(/-/g, '/');
  };

  const getPickerTitle = () => {
    return pickerMode === 'start' ? 'Select Start Date' : 'Select End Date';
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.pickerContainer}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{getPickerTitle()}</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#E53935" />
              </TouchableOpacity>
            </View>
            
            {/* Date Selection Summary */}
            <View style={styles.dateSelectionSummary}>
              <View style={styles.selectedDatesInfo}>
                <View style={styles.dateInfoItem}>
                  <Text style={styles.dateInfoLabel}>Start Date:</Text>
                  <Text style={[
                    styles.dateInfoValue, 
                    startDate ? styles.dateInfoValueFilled : null,
                    pickerMode === 'start' ? styles.dateInfoValueActive : null
                  ]}>
                    {startDate ? formatDisplayDate(startDate) : 'Not selected'}
                  </Text>
                </View>
                
                <View style={styles.dateInfoDivider} />
                
                <View style={styles.dateInfoItem}>
                  <Text style={styles.dateInfoLabel}>End Date:</Text>
                  <Text style={[
                    styles.dateInfoValue, 
                    endDate ? styles.dateInfoValueFilled : null,
                    pickerMode === 'end' ? styles.dateInfoValueActive : null
                  ]}>
                    {endDate ? formatDisplayDate(endDate) : 'Not selected'}
                  </Text>
                </View>
              </View>
              
              {pickerMode === 'end' && startDate && (
                <Text style={styles.dateSelectionHint}>
                  End date must be on or after {formatDisplayDate(startDate)}
                </Text>
              )}
            </View>
            
            <DatePicker
              mode="calendar"
              current={getCurrentDate()}
              minimumDate={getMinimumDate()}
              onDateChange={onDateSelect}
              options={{
                backgroundColor: '#FFF',
                textHeaderColor: '#000',
                textDefaultColor: '#000',
                selectedTextColor: '#FFF',
                mainColor: '#E53935',
                textSecondaryColor: '#666',
                borderColor: 'rgba(229, 57, 53, 0.2)',
              }}
            />
            
            <View style={styles.pickerFooter}>
              <View style={styles.switchModeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.switchModeButton, 
                    pickerMode === 'start' ? styles.switchModeButtonActive : null
                  ]}
                  onPress={() => setPickerMode('start')}
                >
                  <Text style={[
                    styles.switchModeText,
                    pickerMode === 'start' ? styles.switchModeTextActive : null
                  ]}>
                    Select Start
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.switchModeButton, 
                    pickerMode === 'end' ? styles.switchModeButtonActive : null
                  ]}
                  onPress={() => setPickerMode('end')}
                >
                  <Text style={[
                    styles.switchModeText,
                    pickerMode === 'end' ? styles.switchModeTextActive : null
                  ]}>
                    Select End
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={onClose}
              >
                <Text style={styles.closeModalText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  dateSelectionSummary: {
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedDatesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfoItem: {
    flex: 1,
  },
  dateInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateInfoValue: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  dateInfoValueFilled: {
    color: '#333',
    fontStyle: 'normal',
  },
  dateInfoValueActive: {
    color: '#E53935',
    fontWeight: '500',
  },
  dateInfoDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  dateSelectionHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  pickerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  switchModeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchModeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  switchModeButtonActive: {
    backgroundColor: '#E53935',
  },
  switchModeText: {
    fontSize: 14,
    color: '#666',
  },
  switchModeTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  closeModalButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  closeModalText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default DatePickerModal; 