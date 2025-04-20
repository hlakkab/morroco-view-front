import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import i18n from '../../translations/i18n';

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
      <Text style={styles.title}>{i18n.t('tours.tourSummary')}</Text>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>{i18n.t('tours.duration')}:</Text>
        <Text style={styles.summaryValue}>
          {schedule.length} {schedule.length === 1 ? i18n.t('tours.day') : i18n.t('tours.days')}
        </Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>{i18n.t('tours.cities')}:</Text>
        <Text style={styles.summaryValue}>
          {Array.from(new Set(schedule.map(day => day.city))).join(', ')}
        </Text>
      </View>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>{i18n.t('tours.activities')}:</Text>
        <Text style={styles.summaryValue}>
          {schedule.reduce((count, day) => count + day.items.length, 0)} {i18n.t('tours.planned')}
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