import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import StepProgress from '../components/StepProgress';
import { RootStackParamList } from '../types/navigation';

interface FormData {
  title: string;
  startDate: string;
  endDate: string;
}

const AddNewTourScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    startDate: '',
    endDate: '',
  });

  const steps = [
    { id: '01', label: 'Basic infos' },
    { id: '02', label: 'Destinations' },
    { id: '03', label: 'Organize' },
  ];

  const handleNext = () => {
    // Validate and proceed to next step
    console.log('Form data:', formData);
    navigation.navigate('AddNewTourDestinations', {
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Add New Tour" />
      
      <View style={styles.content}>
        <StepProgress steps={steps} currentStep={0} />
        
        <Text style={styles.subtitle}>
          To help organize your tour enter some basic infos
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title<Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="My African Cup Nation Tour"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration<Text style={styles.required}>*</Text></Text>
            <View style={styles.durationContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>from</Text>
                <TextInput
                  style={styles.input}
                  value={formData.startDate}
                  onChangeText={(text) => setFormData({ ...formData, startDate: text })}
                  placeholder="Mon 03 Oct 2025"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>to</Text>
                <TextInput
                  style={styles.input}
                  value={formData.endDate}
                  onChangeText={(text) => setFormData({ ...formData, endDate: text })}
                  placeholder="Mon 11 Oct 2025"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Next"
          onPress={handleNext}
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
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
});

export default AddNewTourScreen; 