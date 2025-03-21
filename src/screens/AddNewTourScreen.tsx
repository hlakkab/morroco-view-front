import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import DatePickerModal from '../components/DatePickerModal';
import StepProgress from '../components/StepProgress';
import TourFlowHeader from '../components/tour/TourFlowHeader';
import { RootStackParamList } from '../types/navigation';

interface FormData {
  title: string;
  startDate: string;
  endDate: string;
}

// Define a type for the picker mode
type DatePickerMode = 'start' | 'end';

const AddNewTourScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    startDate: '',
    endDate: '',
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<DatePickerMode>('start');

  const steps = [
    { id: '01', label: 'Basic infos' },
    { id: '02', label: 'Destinations' },
    { id: '03', label: 'Organize' },
  ];

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const [year, month, day] = dateString.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const dayName = days[date.getDay()];
      const dayNum = date.getDate().toString().padStart(2, '0');
      const monthName = months[date.getMonth()];
      const yearNum = date.getFullYear();
      
      return `${dayName} ${dayNum} ${monthName} ${yearNum}`;
    } catch (e) {
      return dateString; // Fallback to the original format if parsing fails
    }
  };

  const handleNext = () => {
    // Validate and proceed to next step
    console.log('Form data:', formData);
    navigation.navigate('AddNewTourDestinations', {
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
  };

  // Open date picker with specified mode
  const openDatePicker = (mode: DatePickerMode) => {
    setPickerMode(mode);
    setShowDatePicker(true);
  };

  // Handle date selection
  const handleDateSelect = (date: string) => {
    if (pickerMode === 'start') {
      setFormData(prev => ({ ...prev, startDate: date }));
    } else {
      setFormData(prev => ({ ...prev, endDate: date }));
    }
    
    // Close the picker after selection
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TourFlowHeader title="Add New Tour" />
      </View>
      
      <View style={styles.content}>
        <StepProgress steps={steps} currentStep={0} />
        
        <Text style={styles.subtitle}>
          To help organize your tour enter some basic infos
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title<Text style={styles.required}>*</Text></Text>
            <View style={[styles.inputWithIcon, formData.title ? styles.inputFilled : null]}>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Enter a memorable title for your tour"
                placeholderTextColor="#999"
              />
              <Feather name="edit-3" size={20} color={formData.title ? "#E53935" : "#666"} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration<Text style={styles.required}>*</Text></Text>
            <View style={styles.durationContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>From</Text>
                <TouchableOpacity 
                  style={[styles.inputWithIcon, formData.startDate ? styles.inputFilled : null]}
                  onPress={() => openDatePicker('start')}
                  activeOpacity={0.7}
                >
                  <Text style={formData.startDate ? styles.dateText : styles.placeholderText}>
                    {formData.startDate ? formatDisplayDate(formData.startDate) : "Start date"}
                  </Text>
                  <Feather 
                    name="calendar" 
                    size={20} 
                    color={formData.startDate ? "#E53935" : "#666"} 
                    style={styles.inputIcon} 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>To</Text>
                <TouchableOpacity 
                  style={[styles.inputWithIcon, formData.endDate ? styles.inputFilled : null]}
                  onPress={() => openDatePicker('end')}
                  activeOpacity={0.7}
                >
                  <Text style={formData.endDate ? styles.dateText : styles.placeholderText}>
                    {formData.endDate ? formatDisplayDate(formData.endDate) : "End date"}
                  </Text>
                  <Feather 
                    name="calendar" 
                    size={20} 
                    color={formData.endDate ? "#E53935" : "#666"} 
                    style={styles.inputIcon} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.dateHint}>
              <Feather name="info" size={12} color="#666" style={{ marginRight: 4 }} />
              Select dates to define your tour's duration
            </Text>
          </View>
        </View>
      </View>

      {/* Use the new DatePickerModal component */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        pickerMode={pickerMode}
        setPickerMode={setPickerMode}
        startDate={formData.startDate}
        endDate={formData.endDate}
        onDateSelect={handleDateSelect}
        formatDisplayDate={formatDisplayDate}
      />

      <View style={styles.footer}>
        <Button 
          title="Next"
          onPress={handleNext}
          disabled={!formData.title || !formData.startDate || !formData.endDate}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 24,
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  required: {
    color: '#E53935',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#000',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputFilled: {
    borderColor: '#E53935',
    borderWidth: 1,
    backgroundColor: 'rgba(229, 57, 53, 0.03)',
  },
  inputIcon: {
    marginLeft: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  dateHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default AddNewTourScreen;