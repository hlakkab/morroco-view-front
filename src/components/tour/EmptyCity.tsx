import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmptyCityProps {
  selectedDay: number;
}

const EmptyCity: React.FC<EmptyCityProps> = ({ selectedDay }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="location" size={48} color="#E0E0E0" />
      <Text style={styles.text}>Please select a city for Day {selectedDay}</Text>
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