import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '../../translations/i18n';

interface EmptyCityProps {
  selectedDay: number;
  startDate?: string;
}

const EmptyCity: React.FC<EmptyCityProps> = ({ selectedDay, startDate }) => {
  // Format the date for the selected day
  const getFormattedDate = () => {
    if (!startDate) return selectedDay.toString();
    
    try {
      const date = new Date(startDate.replace(/\//g, '-'));
      // Add selectedDay - 1 days to the start date
      date.setDate(date.getDate() + (selectedDay - 1));
      
      // Format the date as "Mmm dd" (e.g. "Jul 15")
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const day = date.getDate().toString().padStart(2, '0');
      
      return `${month} ${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return selectedDay.toString();
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="location" size={48} color="#E0E0E0" />
      <Text style={styles.text}>{i18n.t('tours.pleasSelectCity').replace('{day}', getFormattedDate())}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  text: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default EmptyCity; 