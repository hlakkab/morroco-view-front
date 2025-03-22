import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DailySchedule {
  date: string;
  city: string;
  items: any[];
}

interface TourSummaryProps {
  schedule: DailySchedule[];
}

const TourSummary: React.FC<TourSummaryProps> = ({ schedule }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tour Summary</Text>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Duration:</Text>
        <Text style={styles.summaryValue}>{schedule.length} days</Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Cities:</Text>
        <Text style={styles.summaryValue}>
          {Array.from(new Set(schedule.map(day => day.city))).join(', ')}
        </Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Activities:</Text>
        <Text style={styles.summaryValue}>
          {schedule.reduce((count, day) => count + day.items.length, 0)} planned
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
});

export default TourSummary; 