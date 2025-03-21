import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DayHeaderProps {
  date: string;
  dayNumber: number;
  city: string;
}

const DayHeader: React.FC<DayHeaderProps> = ({ date, dayNumber, city }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.dayNumberBadge}>
          <Text style={styles.dayNumberText}>Day {dayNumber}</Text>
        </View>
        {city && <Text style={styles.cityBadge}>{city}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'nowrap',
  },
  leftSection: {
    flex: 1,
    marginRight: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dayNumberBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  dayNumberText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cityBadge: {
    fontSize: 14,
    color: '#FFF',
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default DayHeader; 