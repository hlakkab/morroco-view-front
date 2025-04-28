import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
import TourDayHeader from '../components/tour/TourDayHeader';
import TourFlowHeader from '../components/tour/TourFlowHeader';
import TourSummary from '../components/tour/TourSummary';
import TrajectoryButton from '../components/tour/TrajectoryButton';
import Timeline from '../containers/tour/Timeline';
import { useAppDispatch } from '../store';
import { saveTour, saveTourThunk, setTourItems } from '../store/tourSlice';
import i18n from '../translations/i18n';
import { RootStackParamList, SavedItem } from '../types/navigation';
import { TourSavedItem } from '../types/tour';

// Morocco cities coordinates
const CITY_COORDINATES = {
  'Casablanca': { latitude: 33.589886, longitude: -7.603869 },
  'Rabat': { latitude: 34.020882, longitude: -6.841650 },
  'Marrakech': { latitude: 31.628674, longitude: -7.992047 },
  'Agadir': { latitude: 30.427755, longitude: -9.598107 },
  'Tangier': { latitude: 35.759465, longitude: -5.833954 },
  'Fez': { latitude: 34.033333, longitude: -5.000000 },
  'Meknes': { latitude: 33.893333, longitude: -5.554722 },
  'Essaouira': { latitude: 31.513056, longitude: -9.77 },
};

// Extend TourSavedItem to include tour-specific properties
interface TourItem extends TourSavedItem {
  duration?: string;
  timeSlot?: string;
}

interface DailySchedule {
  date: string;
  city: string;
  items: TourItem[];
}

// Map TourItem to SavedItem for Timeline compatibility
const mapTourItemToSavedItem = (item: TourItem): SavedItem => {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    subtitle: item.subtitle,
    city: item.city,
    duration: item.duration,
    timeSlot: item.timeSlot,
    images: item.images
  };
};

const AddNewTourOrganizeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNewTourOrganize'>>();
  const { title, startDate, endDate, selectedItemsByDay, cities, savedItems, viewMode } = route.params;
  const dispatch = useAppDispatch();
  
  const [schedule, setSchedule] = useState<DailySchedule[]>([]);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{dayIndex: number, itemIndex: number} | null>(null);
  const [durationText, setDurationText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const steps = [
    { id: '01', label: i18n.t('tours.basicInfos') },
    { id: '02', label: i18n.t('tours.destinations') },
    { id: '03', label: i18n.t('tours.organize') },
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
        }).filter(Boolean) as TourSavedItem[];
        
        // Only add days with items
        if (dayItems.length > 0) {
          scheduleDays.push({
            date: formatDateString(currentDate),
            city: cities[dayNumber] || 'Unknown',
            items: dayItems.sort((a, b) => getItemTypeOrder(a.type) - getItemTypeOrder(b.type))
          });
        }
      });
      
      setSchedule(scheduleDays);
    } catch (e) {
      console.error("Error preparing schedule:", e);
      setSchedule([]);
    }
  }, [startDate, endDate, selectedItemsByDay, cities, savedItems]);

  const getItemTypeOrder = (type: string): number => {
    switch(type) {
      case 'hotel': return 4;
      case 'restaurant': return 2; 
      case 'match': return 1;
      case 'entertainment': return 3;
      case 'monument': return 5;
      case 'money-exchange': return 6;
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
          // Map SavedItem back to TourItem
          const tourItems = newItems.map(item => {
            const originalItem = day.items.find(original => original.id === item.id);
            if (!originalItem) return null;
            return {
              ...originalItem,
              duration: item.duration,
              timeSlot: item.timeSlot
            };
          }).filter(Boolean) as TourItem[];
          
          return {
            ...day,
            items: tourItems
          };
        }
        return day;
      });
    });
  }, []);

  // Add coordinates to items based on city
  const addCoordinatesToItems = (items: TourSavedItem[]): TourSavedItem[] => {

    console.log('items', items);


    return items.map(item => {
      // If item already has coordinates, use them
      if (item.coordinate) {
        return item;
      }
      
      // Use city coordinates as a fallback
      if (item.city && CITY_COORDINATES[item.city as keyof typeof CITY_COORDINATES]) {
        return {
          ...item,
          coordinate: CITY_COORDINATES[item.city as keyof typeof CITY_COORDINATES]
        };
      }
      
      // Default to Marrakech center if nothing else found
      return {
        ...item,
        coordinate: { latitude: 31.628674, longitude: -7.992047 }
      };
    });
  };

  const handleSaveTour = () => {
    // Process all items from the schedule and add coordinates
    const allItems: TourSavedItem[] = [];
    
    schedule.forEach(day => {
      day.items.forEach(item => {
        allItems.push(item);
      });
    });
    
    const itemsWithCoordinates = addCoordinatesToItems(allItems);
    
    // Transform date from yyyy/mm/dd to yyyy-mm-dd if needed
    const formatDate = (dateStr: string): string => {
      if (dateStr.includes('/')) {
        return dateStr.split('/').join('-');
      }
      return dateStr;
    };

    // Transform date from "Tuesday, March 25, 2025" to "yyyy-mm-dd"
    const transformDateString = (dateStr: string): string => {
      const months: { [key: string]: number } = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3,
        'May': 4, 'June': 5, 'July': 6, 'August': 7,
        'September': 8, 'October': 9, 'November': 10, 'December': 11
      };

      // Split the date string into parts
      const parts = dateStr.split(', ');
      if (parts.length !== 3) return dateStr;

      const monthDay = parts[1].split(' ');
      if (monthDay.length !== 2) return dateStr;

      const month = monthDay[0];
      const day = parseInt(monthDay[1]);
      const year = parseInt(parts[2]);

      if (isNaN(day) || isNaN(year) || !months[month]) return dateStr;

      // Create date object (months are 0-based in JavaScript Date)
      const date = new Date(year, months[month], day);
      
      // Format as yyyy-mm-dd
      return `${year}-${String(months[month] + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Transform items to use coordinates instead of coordinate
    const transformedItems = itemsWithCoordinates.map(item => {
      const { coordinate, images, ...rest } = item;
      // Find the day this item belongs to in the schedule
      const daySchedule = schedule.find(day => 
        day.items.some(dayItem => dayItem.id === item.id)
      );
      
      return {
        ...rest,
        coordinates: coordinate ? `${coordinate.latitude},${coordinate.longitude}` : undefined,
        date: daySchedule?.date ? transformDateString(daySchedule.date) : undefined,
        image: images?.[0] || undefined
      };
    });
    
    // Use the saveTourThunk instead of saveTour
    dispatch(saveTourThunk({
      title: title || "My Tour",
      from: formatDate(startDate),
      to: formatDate(endDate),
      destinations: transformedItems as unknown as TourSavedItem[]
    }));
    
    // Navigate to map view with the items
    navigation.navigate("Tours")
  };

  // Create day options for TourDayHeader
  const dayOptions = useMemo(() => {
    return schedule.map((day, index) => ({
      id: index + 1,
      label: `Day ${index + 1}`,
      city: day.city,
      date: day.date
    }));
  }, [schedule]);

  // Callbacks for navigating between days
  const handlePrevDay = useCallback(() => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  }, [selectedDayIndex]);

  const handleNextDay = useCallback(() => {
    if (selectedDayIndex < schedule.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  }, [selectedDayIndex, schedule.length]);

  // Handle day selection
  const handleSelectDay = useCallback((dayId: number) => {
    setSelectedDayIndex(dayId - 1);
  }, []);

  // Handle preview trajectory button press
  const handleViewTrajectory = useCallback(() => {
    if (schedule[selectedDayIndex]) {
      const dayItems = schedule[selectedDayIndex].items;
      const itemsWithCoordinates = addCoordinatesToItems(dayItems);


      console.log('itemsWithCoordinates', itemsWithCoordinates.map(item => item.title));
      
      // Navigate to map view with the items for this day
      navigation.navigate('TourMapScreen', {
        tourItems: itemsWithCoordinates,
        title: `Day ${selectedDayIndex + 1} - ${schedule[selectedDayIndex].city}`,
        singleDayView: true
      });
    }
  }, [schedule, selectedDayIndex, navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {!viewMode ? (
          <View style={styles.headerContainer}>
            <TourFlowHeader title={i18n.t('tours.addNewTour')} />
          </View>
        ) : (
          <View style={styles.headerContainer}>
            <ScreenHeader title={i18n.t('tours.tourDetails')} />
          </View>
        )}
        
        {!viewMode && (
          <View style={styles.stepProgressContainer}>
            <StepProgress 
              steps={steps} 
              currentStep={2}
              onStepPress={handleStepPress}
            />
          </View>
        )}
        
        {schedule.length > 0 ? (
          <>
            <View style={styles.dayHeaderContainer}>
              <TourDayHeader
                title={title || i18n.t('tours.myTour')}
                days={dayOptions}
                selectedDay={selectedDayIndex + 1}
                onSelectDay={handleSelectDay}
                onPrevDay={handlePrevDay}
                onNextDay={handleNextDay}
                startDate={startDate}
              />
            </View>
            
            <ScrollView 
              style={styles.content}
              scrollEventThrottle={16}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.dayContainer}>
                <DayHeader 
                  date={schedule[selectedDayIndex].date}
                  dayNumber={selectedDayIndex + 1}
                  city={schedule[selectedDayIndex].city}
                />
                
                <Timeline 
                  items={schedule[selectedDayIndex].items.map(mapTourItemToSavedItem)}
                  onSetTime={(itemIndex: number) => handleSetTime(selectedDayIndex, itemIndex)}
                  onSetDuration={(itemIndex: number) => handleSetDuration(selectedDayIndex, itemIndex)}
                  onReorderItems={(newItems: SavedItem[]) => handleReorderItems(selectedDayIndex, newItems)}
                />
                
                <TrajectoryButton
                  onPress={handleViewTrajectory}
                  itemCount={schedule[selectedDayIndex].items.length}
                />
              </View>
              
              <TourSummary schedule={schedule} />
            </ScrollView>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="calendar-outline" size={64} color="#E0E0E0" />
            <Text style={styles.noDataText}>{i18n.t('tours.noScheduleData')}</Text>
            <Text style={styles.noDataHint}>
              {i18n.t('tours.addDestinationsHint')}
            </Text>
          </View>
        )}
        
        {!viewMode && (
          <View style={styles.footer}>
            <Button 
              title={i18n.t('tours.saveTour')}
              onPress={handleSaveTour}
            />
          </View>
        )}
        
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
    marginVertical: 0,
  },
  dayHeaderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayContainer: {
    
  },
  noDataContainer: {
    flex: 1,
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