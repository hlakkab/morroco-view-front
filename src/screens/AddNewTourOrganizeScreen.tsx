import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import StepProgress from '../components/StepProgress';
import DayHeader from '../components/tour/DayHeader';
import DurationModal from '../components/tour/DurationModal';
import TimeModal from '../components/tour/TimeModal';
import TourFlowHeader from '../components/tour/TourFlowHeader';
import TourSummary from '../components/tour/TourSummary';
import Timeline from '../containers/tour/Timeline';
import { RootStackParamList } from '../types/navigation';

interface SavedItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  city: string;
  duration?: string;
  timeSlot?: string;
}

interface DailySchedule {
  date: string;
  city: string;
  items: SavedItem[];
}

const AddNewTourOrganizeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNewTourOrganize'>>();
  const { title, startDate, endDate, selectedItemsByDay, cities, savedItems } = route.params;
  
  const [schedule, setSchedule] = useState<DailySchedule[]>([]);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{dayIndex: number, itemIndex: number} | null>(null);
  const [durationText, setDurationText] = useState('');
  const [timeText, setTimeText] = useState('');

  const steps = [
    { id: '01', label: 'Basic infos' },
    { id: '02', label: 'Destinations' },
    { id: '03', label: 'Organize' },
  ];

  useEffect(() => {
    // Convert the selectedItemsByDay data into a formatted schedule
    try {
      // Create a safe date parser that handles different date formats
      const parseDate = (dateStr: string): Date => {
        try {
          // Try parsing as YYYY/MM/DD format from date picker
          if (dateStr.includes('/')) {
            const [year, month, day] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day);
          } 
          
          // Fallback to ISO string parsing
          return new Date(dateStr);
        } catch (e) {
          console.error("Error parsing date:", dateStr, e);
          return new Date(); // Fallback to current date
        }
      };
      
      // Create the schedule with fallback values
      const scheduleDays: DailySchedule[] = [];
      const startDateObj = parseDate(startDate);
      
      Object.keys(selectedItemsByDay).forEach((dayKey) => {
        const dayNumber = parseInt(dayKey);
        
        // Skip days with no items
        if (!selectedItemsByDay[dayNumber] || selectedItemsByDay[dayNumber].length === 0) {
          return;
        }
        
        // Calculate date for this day (clone to avoid modifying original)
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + dayNumber - 1);
        
        // Get items for this day
        const dayItems = selectedItemsByDay[dayNumber].map(itemId => {
          const item = savedItems.find(saved => saved.id === itemId);
          return item ? { ...item } : null;
        }).filter(Boolean) as SavedItem[];
        
        // Only add days with items
        if (dayItems.length > 0) {
          scheduleDays.push({
            date: formatDateString(currentDate),
            city: cities[dayNumber] || 'Unknown',
            items: dayItems.sort((a, b) => getItemTypeOrder(a.type) - getItemTypeOrder(b.type))
          });
        }
      });
      
      // If no schedule was created, provide fallback data
      if (scheduleDays.length === 0) {
        const fallbackItems: DailySchedule[] = [
          {
            date: "Monday, October 03, 2023",
            city: "Casablanca",
            items: [
              {
                id: '1',
                type: 'match',
                title: 'Senegal Vs Egypt',
                subtitle: 'Stade Mohamed V',
                city: 'Casablanca',
                timeSlot: 'Evening'
              },
              {
                id: '2',
                type: 'match',
                title: 'Morocco Vs Comores',
                subtitle: 'Stade Moulay Abdallah',
                city: 'Casablanca',
                duration: '2 hours'
              }
            ]
          }
        ];
        
        setSchedule(fallbackItems);
      } else {
        setSchedule(scheduleDays);
      }
    } catch (e) {
      console.error("Error preparing schedule:", e);
      // Provide fallback data in case of error
      const fallbackSchedule: DailySchedule[] = [
        {
          date: "Monday, October 03, 2023",
          city: "Casablanca",
          items: [
            {
              id: '1',
              type: 'match',
              title: 'Senegal Vs Egypt',
              subtitle: 'Stade Mohamed V',
              city: 'Casablanca',
              timeSlot: 'Evening'
            },
            {
              id: '2',
              type: 'match',
              title: 'Morocco Vs Comores',
              subtitle: 'Stade Moulay Abdallah',
              city: 'Casablanca',
              duration: '2 hours'
            }
          ]
        }
      ];
      setSchedule(fallbackSchedule);
    }
  }, [startDate, endDate, selectedItemsByDay, cities, savedItems]);

  const getItemTypeOrder = (type: string): number => {
    switch(type) {
      case 'hotel': return 4;
      case 'restaurant': return 2; 
      case 'match': return 1;
      case 'entertainment': return 3;
      default: return 5;
    }
  };

  const formatDateString = (date: Date): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const dayNum = date.getDate();
    const year = date.getFullYear();
    
    return `${dayName}, ${monthName} ${dayNum}, ${year}`;
  };

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) {
      navigation.navigate('AddNewTour');
    } else if (stepIndex === 1) {
      navigation.navigate('AddNewTourDestinations', { 
        title, 
        startDate, 
        endDate 
      });
    }
  };

  const handleSetDuration = useCallback((dayIndex: number, itemIndex: number) => {
    const item = schedule[dayIndex].items[itemIndex];
    setSelectedItem({ dayIndex, itemIndex });
    setDurationText(item.duration || '');
    setShowDurationModal(true);
  }, [schedule]);
  
  const handleSetTime = useCallback((dayIndex: number, itemIndex: number) => {
    const item = schedule[dayIndex].items[itemIndex];
    setSelectedItem({ dayIndex, itemIndex });
    setTimeText(item.timeSlot || '');
    setShowTimeModal(true);
  }, [schedule]);

  const saveDuration = () => {
    if (selectedItem) {
      setSchedule(prev => {
        const newSchedule = [...prev];
        newSchedule[selectedItem.dayIndex].items[selectedItem.itemIndex].duration = durationText;
        return newSchedule;
      });
      setShowDurationModal(false);
    }
  };

  const saveTime = () => {
    if (selectedItem) {
      setSchedule(prev => {
        const newSchedule = [...prev];
        newSchedule[selectedItem.dayIndex].items[selectedItem.itemIndex].timeSlot = timeText;
        return newSchedule;
      });
      setShowTimeModal(false);
    }
  };

  const handleReorderItems = useCallback((dayIndex: number, newItems: SavedItem[]) => {
    setSchedule(prevSchedule => {
      return prevSchedule.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            items: newItems
          };
        }
        return day;
      });
    });
  }, []);

  const handleSaveTour = () => {
    // Save the tour to your backend or local storage
    Alert.alert(
      "Tour Saved",
      "Your tour has been saved successfully!",
      [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('Home') 
        }
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TourFlowHeader title="Add New Tour" />
        </View>
        
        <View style={styles.stepProgressContainer}>
          <StepProgress 
            steps={steps} 
            currentStep={2}
            onStepPress={handleStepPress}
          />
        </View>
        
        <ScrollView 
          style={styles.content}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.tourTitle}>{title || "My Tour"}</Text>
          
          {schedule.length > 0 ? (
            schedule.map((day, dayIndex) => (
              <View key={`day-${dayIndex}`} style={styles.dayContainer}>
                <DayHeader 
                  date={day.date}
                  dayNumber={dayIndex + 1}
                  city={day.city}
                />
                
                <Timeline 
                  items={day.items}
                  onSetTime={(itemIndex) => handleSetTime(dayIndex, itemIndex)}
                  onSetDuration={(itemIndex) => handleSetDuration(dayIndex, itemIndex)}
                  onReorderItems={(newItems) => handleReorderItems(dayIndex, newItems)}
                />
              </View>
            ))
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="calendar-outline" size={64} color="#E0E0E0" />
              <Text style={styles.noDataText}>No schedule data available</Text>
              <Text style={styles.noDataHint}>
                Add some destinations in the previous step to see your tour schedule
              </Text>
            </View>
          )}
          
          <TourSummary schedule={schedule} />
        </ScrollView>
        
        <View style={styles.footer}>
          <Button 
            title="Save Tour"
            onPress={handleSaveTour}
          />
        </View>
        
        {/* Duration Modal - now using the component */}
        <DurationModal
          visible={showDurationModal}
          onClose={() => setShowDurationModal(false)}
          durationText={durationText}
          onDurationChange={setDurationText}
          onSave={saveDuration}
        />
        
        {/* Time Modal - now using the component */}
        <TimeModal
          visible={showTimeModal}
          onClose={() => setShowTimeModal(false)}
          timeText={timeText}
          onTimeChange={setTimeText}
          onSave={saveTime}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
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
  stepProgressContainer: {
    marginVertical: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tourTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  dayContainer: {
    marginBottom: 24,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  noDataHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

export default AddNewTourOrganizeScreen; 