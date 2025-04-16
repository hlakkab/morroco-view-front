import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CitySelectorProps {
  cities: string[];
  selectedCity: string;
  selectedDay: number;
  isLocked: boolean;
  onCityChange: (city: string) => void;
  startDate: string;
}

const CitySelector: React.FC<CitySelectorProps> = ({
  cities,
  selectedCity,
  selectedDay,
  isLocked,
  onCityChange,
  startDate,
}) => {
  // Function to format date as "DD MMM"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Function to get date for a specific day
  const getDateForDay = (day: number) => {
    const date = new Date(startDate.replace(/\//g, '-'));
    date.setDate(date.getDate() + (day - 1));
    return formatDate(date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>City for {getDateForDay(selectedDay)}:</Text>
        {isLocked && (
          <View style={styles.lockedBadge}>
            <Ionicons name="lock-closed" size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {cities.map(city => {
          const isCitySelected = selectedCity === city;
          const isCityDisabled = isLocked && !isCitySelected;
          
          return (
            <TouchableOpacity
              key={`city-${city}`}
              style={[
                styles.cityButton,
                isCitySelected && styles.selectedCityButton,
                isCityDisabled && styles.disabledCityButton
              ]}
              onPress={() => !isCityDisabled && onCityChange(city)}
              disabled={isCityDisabled}
            >
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={isCitySelected ? '#fff' : isCityDisabled ? '#ccc' : '#888'} 
                style={{ marginRight: 4 }} 
              />
              <Text style={[
                styles.cityButtonText,
                isCitySelected && styles.selectedCityButtonText,
                isCityDisabled && styles.disabledCityButtonText
              ]}>
                {city}
              </Text>
              {isCitySelected && (
                <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 8,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  lockedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '500',
  },
  scrollView: {
    marginBottom: 10,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCityButton: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  disabledCityButton: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  cityButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCityButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  disabledCityButtonText: {
    color: '#CCC',
  },
});

export default CitySelector; 