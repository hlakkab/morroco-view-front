import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DayOption {
  id: number;
  label: string;
  city: string;
  date: string;
}

interface TourDayHeaderProps {
  title: string;
  days: DayOption[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  startDate: string;
}

const TourDayHeader: React.FC<TourDayHeaderProps> = ({
  title,
  days,
  selectedDay,
  onSelectDay,
  onPrevDay,
  onNextDay,
  startDate,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Find the currently selected day
  const currentDay = days.find(day => day.id === selectedDay) || days[0];
  
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
  
  const handleSelectDay = (dayId: number) => {
    onSelectDay(dayId);
    setModalVisible(false);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.tourTitle}>{title}</Text>
      
      <View style={styles.dayNavigationContainer}>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={onPrevDay}
          disabled={days.length <= 1 || selectedDay === days[0]?.id}
        >
          <Feather 
            name="chevron-left" 
            size={24} 
            color={days.length <= 1 || selectedDay === days[0]?.id ? "#ccc" : "#E53935"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.daySelector}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.daySelectorContent}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>{getDateForDay(currentDay?.id || 1)}</Text>
            </View>
            <Text style={styles.cityText} numberOfLines={1}>{currentDay?.city}</Text>
            <Feather name="chevron-down" size={16} color="#666" style={styles.dropdownIcon} />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={onNextDay}
          disabled={days.length <= 1 || selectedDay === days[days.length - 1]?.id}
        >
          <Feather 
            name="chevron-right" 
            size={24} 
            color={days.length <= 1 || selectedDay === days[days.length - 1]?.id ? "#ccc" : "#E53935"} 
          />
        </TouchableOpacity>
      </View>
      
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Day</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#E53935" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={days}
              keyExtractor={item => `day-option-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.dayOption,
                    item.id === selectedDay && styles.selectedDayOption
                  ]}
                  onPress={() => handleSelectDay(item.id)}
                >
                  <View style={styles.dayOptionLeft}>
                    <View style={[
                      styles.dayOptionBadge,
                      item.id === selectedDay && styles.selectedDayOptionBadge
                    ]}>
                      <Text style={[
                        styles.dayOptionBadgeText,
                        item.id === selectedDay && styles.selectedDayOptionBadgeText
                      ]}>
                        {getDateForDay(item.id)}
                      </Text>
                    </View>
                    <View style={styles.dayOptionTextContainer}>
                      <Text style={[
                        styles.dayOptionCity,
                        item.id === selectedDay && styles.selectedDayOptionCity
                      ]}>
                        {item.city}
                      </Text>
                    </View>
                  </View>
                  
                  {item.id === selectedDay && (
                    <Feather name="check" size={20} color="#E53935" />
                  )}
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  dayNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  daySelector: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  daySelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    backgroundColor: '#E53935',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  dayBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  cityText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  optionsList: {
    paddingVertical: 8,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedDayOption: {
    backgroundColor: '#FFF0F0',
  },
  dayOptionBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  selectedDayOptionBadge: {
    backgroundColor: '#E53935',
  },
  dayOptionBadgeText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 12,
  },
  selectedDayOptionBadgeText: {
    color: '#FFFFFF',
  },
  dayOptionTextContainer: {
    flex: 1,
  },
  dayOptionCity: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedDayOptionCity: {
    fontWeight: '600',
  },
});

export default TourDayHeader; 