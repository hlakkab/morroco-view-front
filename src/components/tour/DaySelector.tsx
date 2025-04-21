import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../translations/i18n';

interface DayStatus {
  status: 'empty' | 'selected' | 'locked';
  city: string;
}

interface DaySelectorProps {
  totalDays: number;
  selectedDay: number;
  getDayStatus: (day: number) => DayStatus;
  onSelectDay: (day: number) => void;
  startDate: string;
}

const DaySelector: React.FC<DaySelectorProps> = ({
  totalDays,
  selectedDay,
  getDayStatus,
  onSelectDay,
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
      <Text style={styles.title}>{i18n.t('tours.chooseDay')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => {
          const dayStatus = getDayStatus(day);
          const isDaySelected = selectedDay === day;
          const date = getDateForDay(day);
          
          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayButton,
                isDaySelected && styles.selectedDayButton,
                dayStatus.status === 'locked' && styles.lockedDayButton
              ]}
              onPress={() => onSelectDay(day)}
            >
              <Text style={[
                styles.dayButtonText,
                isDaySelected && styles.selectedDayButtonText,
                dayStatus.status === 'locked' && styles.lockedDayButtonText
              ]}>
                {date}
              </Text>
              {dayStatus.status !== 'empty' && (
                <View style={styles.dayStatusIndicator}>
                  <Text 
                    style={dayStatus.status === 'locked' ? styles.lockedDayStatusCity : styles.dayStatusCity} 
                    numberOfLines={1}
                  >
                    {dayStatus.city}
                  </Text>
                  {dayStatus.status === 'locked' && (
                    <Ionicons name="lock-closed" size={12} color="#E53935" />
                  )}
                </View>
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
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  scrollView: {
    marginBottom: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  selectedDayButton: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  lockedDayButton: {
    backgroundColor: '#FFF0F0',
    borderColor: '#E53935',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedDayButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  lockedDayButtonText: {
    color: '#E53935',
    fontWeight: '500',
  },
  dayStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  dayStatusCity: {
    fontSize: 10,
    color: '#F1F1F1',
    marginRight: 4,
    maxWidth: 60,
  },
  lockedDayStatusCity: {
    fontSize: 10,
    color: '#DE6F6D',
    marginRight: 4,
    maxWidth: 60,
  },
});

export default DaySelector; 