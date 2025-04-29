import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import StepProgress from '../components/StepProgress';
import CitySelector from '../components/tour/CitySelector';
import DaySelector from '../components/tour/DaySelector';
import EmptyCity from '../components/tour/EmptyCity';
import TourFlowHeader from '../components/tour/TourFlowHeader';
import ItemList from '../containers/tour/ItemList';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBookmarksAsItems, setTourDestinations, TourItem } from '../store/tourSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import { Dimensions } from 'react-native';



// Calculate the number of days between start and end dates (inclusive)
export const calculateDaysInclusive = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate.replace(/\//g, '-'));
    const end = new Date(endDate.replace(/\//g, '-'));

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 255;
  } catch (e) {
    console.error("Error calculating days:", e);
    return 255;
  }
};

// Morocco cities coordinates
const CITY_COORDINATES = {
  'Casablanca': { latitude: 33.589886, longitude: -7.603869 },
  'Rabat': { latitude: 34.020882, longitude: -6.841650 },
  'Marrakech': { latitude: 31.628674, longitude: -7.992047 },
  'Agadir': { latitude: 30.427755, longitude: -9.598107 },
  'Tangier': { latitude: 35.759465, longitude: -5.833954 },
  'Fez': { latitude: 34.033333, longitude: -5.000000 },
  'Meknes': { latitude: 33.893333, longitude: -5.554722 },
  'Essaouira': { latitude: 31.513056, longitude: -9.770000 },
};

// Specific location coordinates
const LOCATION_COORDINATES = {
  // Casablanca
  'Four Seasons Hotel': { latitude: 33.594910, longitude: -7.634450 },
  'Kōya Restaurant Lounge': { latitude: 33.591850, longitude: -7.631180 },
  
  // Rabat
  'Stade Moulay Abdallah': { latitude: 33.960390, longitude: -6.844232 },
  'Chellah Necropolis': { latitude: 33.954750, longitude: -6.814180 },
  
  // Agadir
  'Sofitel Agadir Royal Bay': { latitude: 30.3931344, longitude: -9.596515 },
  'Marina, Agadir': { latitude: 30.415830, longitude: -9.600680 },
  'Stade Adrar': { latitude: 30.372240, longitude: -9.532750 },
};

// Helper function to ensure items have coordinates
const addCoordinatesToItems = (items: TourItem[]): TourItem[] => {
  return items.map(item => {
    // If item already has coordinates, use them
    if (item.coordinate) {
      return item;
    }
    
    // Check if specific location coordinates exist for this item (by title)
    if (item.title && LOCATION_COORDINATES[item.title as keyof typeof LOCATION_COORDINATES]) {
      return {
        ...item,
        coordinate: LOCATION_COORDINATES[item.title as keyof typeof LOCATION_COORDINATES]
      };
    }
    
    // Check if specific location coordinates exist for this item (by subtitle)
    if (item.subtitle && LOCATION_COORDINATES[item.subtitle as keyof typeof LOCATION_COORDINATES]) {
      return {
        ...item,
        coordinate: LOCATION_COORDINATES[item.subtitle as keyof typeof LOCATION_COORDINATES]
      };
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

// Helper function to find nearby attractions based on coordinates
const findNearbyAttractions = async (
  latitude: number, 
  longitude: number, 
  radius: number = 5000, // 5km radius
  type: string = 'tourist_attraction'
) => {
  try {
    // This is a placeholder for the actual API call
    // In a real implementation, you would call Google Places API or similar
    console.log(`Finding attractions near ${latitude},${longitude} within ${radius}m`);
    
    // Mock response for demonstration
    const mockNearbyAttractions = [
      {
        id: `nearby-${Date.now()}-1`,
        type: 'entertainment',
        title: 'Nearby Attraction 1',
        subtitle: `Located ${Math.round(Math.random() * 1000)}m from selected location`,
        city: getClosestCity(latitude, longitude),
        coordinate: { 
          latitude: latitude + (Math.random() - 0.5) * 0.01, 
          longitude: longitude + (Math.random() - 0.5) * 0.01 
        }
      },
      {
        id: `nearby-${Date.now()}-2`,
        type: 'entertainment',
        title: 'Nearby Attraction 2',
        subtitle: `Located ${Math.round(Math.random() * 1000)}m from selected location`,
        city: getClosestCity(latitude, longitude),
        coordinate: { 
          latitude: latitude + (Math.random() - 0.5) * 0.01, 
          longitude: longitude + (Math.random() - 0.5) * 0.01 
        }
      }
    ];
    
    return mockNearbyAttractions;
  } catch (error) {
    console.error('Error finding nearby attractions:', error);
    return [];
  }
};

// Helper function to find closest city to coordinates
const getClosestCity = (latitude: number, longitude: number) => {
  let closestCity = 'Marrakech'; // Default
  let minDistance = Number.MAX_VALUE;
  
  Object.entries(CITY_COORDINATES).forEach(([city, coords]) => {
    const distance = calculateDistance(
      latitude, longitude, 
      coords.latitude, coords.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  });
  
  return closestCity;
};

// Haversine formula to calculate distance between coordinates (in km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};

const AddNewTourDestinationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNewTourDestinations'>>();
  
  // Get tour data from Redux instead of route params
  const { title, startDate, endDate } = useAppSelector(state => state.tour.currentTour);
  const availableItems = useAppSelector(state => state.tour.availableItems);
  const loading = useAppSelector(state => state.tour.loading);
  const error = useAppSelector(state => state.tour.error);
  const dispatch = useAppDispatch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedCities, setSelectedCities] = useState<Record<number, string>>({});
  const [selectedItemsByDay, setSelectedItemsByDay] = useState<Record<number, string[]>>({});
  const [totalDays, setTotalDays] = useState(4);

  // Fetch bookmarks when component mounts
  useEffect(() => {
    dispatch(fetchBookmarksAsItems());
  }, [dispatch]);

  // Use availableItems from Redux store instead of local state
  const cities = useMemo(() => {
    // Extract unique cities from available items
    const uniqueCities = Array.from(new Set(availableItems.map(item => item.city)));
    // Sort alphabetically
    return uniqueCities.sort();
  }, [availableItems]);

  const steps = [
    { id: '01', label: i18n.t('tours.basicInfos') },
    { id: '02', label: i18n.t('tours.destinations') },
    { id: '03', label: i18n.t('tours.organize') },
  ];

  useEffect(() => {
    if (startDate && endDate) {
      // Use the extracted utility function
      const days = calculateDaysInclusive(startDate, endDate);
      setTotalDays(days);
      
      // Initialize selected cities and items for all days
      const initialCities: Record<number, string> = {};
      const initialSelectedItems: Record<number, string[]> = {};
      
      for (let i = 1; i <= days; i++) {
        initialCities[i] = ''; // Start with no selected city
        initialSelectedItems[i] = [];
      }
      
      setSelectedCities(initialCities);
      setSelectedItemsByDay(initialSelectedItems);
    }
  }, [startDate, endDate]);

  // Check if a city is locked for the current day
  const isCityLockedForCurrentDay = useMemo(() => {
    return selectedItemsByDay[selectedDay]?.length > 0;
  }, [selectedItemsByDay, selectedDay]);

  // Determine if a day has selections and thus a locked city
  const getDayStatus = (day: number) => {
    const hasSelections = selectedItemsByDay[day]?.length > 0;
    const hasCity = !!selectedCities[day];
    
    if (hasSelections) {
      return { status: 'locked' as const, city: selectedCities[day] };
    } else if (hasCity) {
      return { status: 'selected' as const, city: selectedCities[day] };
    }
    return { status: 'empty' as const, city: '' };
  };

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex === 0) {
      navigation.navigate('AddNewTour');
    }
  };

  const handleItemSelect = (itemId: string, itemCity: string) => {
    // If no items are selected for this day yet, lock in the city
    if (selectedItemsByDay[selectedDay]?.length === 0 && !selectedCities[selectedDay]) {
      setSelectedCities(prev => ({
        ...prev,
        [selectedDay]: itemCity
      }));
    }

    setSelectedItemsByDay(prev => {
      const currentDayItems = [...(prev[selectedDay] || [])];
      
      if (currentDayItems.includes(itemId)) {
        const updatedItems = currentDayItems.filter(id => id !== itemId);
        return {
          ...prev,
          [selectedDay]: updatedItems
        };
      }
      
      return {
        ...prev,
        [selectedDay]: [...currentDayItems, itemId]
      };
    });
  };

  const handleCityChange = (city: string) => {
    // Check if there are already items selected for this day
    if (selectedItemsByDay[selectedDay]?.length > 0 && selectedCities[selectedDay] !== city) {
      Alert.alert(
        i18n.t('common.filter'),
        i18n.t('tours.changeCityConfirmation', { day: selectedDay }),
        [
          {
            text: i18n.t('common.cancel'),
            style: "cancel"
          },
          {
            text: i18n.t('tours.changeCity'),
            onPress: () => {
              setSelectedCities(prev => ({
                ...prev,
                [selectedDay]: city
              }));
              setSelectedItemsByDay(prev => ({
                ...prev,
                [selectedDay]: []
              }));
            }
          }
        ]
      );
    } else {
      setSelectedCities(prev => ({
        ...prev,
        [selectedDay]: city
      }));
    }
  };

  const handleNext = () => {
    // Check if at least one item is selected for the tour
    const totalSelectedCount = Object.values(selectedItemsByDay).reduce(
      (count, items) => count + items.length, 0
    );
    
    if (totalSelectedCount === 0) {
      Alert.alert(
        i18n.t('tours.noDestinationsSelected'),
        i18n.t('tours.pleaseSelectDestination')
      );
      return;
    }
    
    // Save destinations in Redux
    const destinationCities = Object.values(selectedCities).filter(city => city);
    dispatch(setTourDestinations(destinationCities));
    
    // Get selected items with their coordinates
    const selectedItems = availableItems.filter(item => 
      Object.values(selectedItemsByDay).some(dayItems => 
        dayItems.includes(item.id)
      )
    );
    
    // Ensure all items have coordinates
    const selectedItemsWithCoordinates = addCoordinatesToItems(selectedItems);
    
    // Log the items with coordinates for debugging
    console.log('Items with specific coordinates:', 
      selectedItemsWithCoordinates.map(item => ({
        title: item.title,
        hasSpecificCoordinates: item.coordinate !== CITY_COORDINATES[item.city as keyof typeof CITY_COORDINATES]
      }))
    );
    
    // Navigate to the third step
    navigation.navigate('AddNewTourOrganize', {
      selectedItemsByDay,
      cities: selectedCities,
      savedItems: selectedItemsWithCoordinates,
      title,
      startDate,
      endDate
    });
  };

  // Filter items by selected city and search query
  const filteredItems = useMemo(() => {
    const filtered = availableItems.filter(item => {
      // If a city is selected for the current day, only show items from that city
      const selectedCity = selectedCities[selectedDay];
      const matchesCity = selectedCity ? item.city === selectedCity : true;
      
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCity && matchesSearch;
    });
    
    // Ensure all filtered items have coordinates
    return addCoordinatesToItems(filtered);
  }, [availableItems, selectedCities, selectedDay, searchQuery]);

  // const totalSelectedCount = useMemo(() => {
  //   return Object.values(selectedItemsByDay).reduce(
  //     (count, items) => count + items.length, 0
  //   );
  // }, [selectedItemsByDay]);


  // Nombre d'items sélectionnés pour la ville du jour actuellement sélectionné
  const currentCitySelectedCount = useMemo(
      () => selectedItemsByDay[selectedDay]?.length || 0,
      [selectedItemsByDay, selectedDay]
  );

  //  Calcule les IDs déjà choisis hors du jour courant
  const previouslySelectedItemIds = useMemo(
      () =>
          Object.entries(selectedItemsByDay)
              .filter(([day]) => Number(day) !== selectedDay) // tous les jours sauf le jour actif
              .flatMap(([, items]) => items),                // puis on « aplati » la liste
      [selectedItemsByDay, selectedDay]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TourFlowHeader title={i18n.t('tours.addNewTour')} />
      </View>
      
      <View style={styles.stepProgressContainer}>
        <StepProgress 
          steps={steps} 
          currentStep={1}
          onStepPress={handleStepPress}
        />
      </View>

      <View style={styles.content}>
        {/* <SearchBar
          placeholder="Search for ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {}}
        /> */}

        {/* Day Selector Component */}
        <DaySelector
          totalDays={totalDays}
          selectedDay={selectedDay}
          getDayStatus={getDayStatus}
          onSelectDay={setSelectedDay}
          startDate={startDate}
        />

        {/* City Selector Component */}
        <CitySelector
          cities={cities}
          selectedCity={selectedCities[selectedDay] || ''}
          selectedDay={selectedDay}
          isLocked={isCityLockedForCurrentDay}
          onCityChange={handleCityChange}
          startDate={startDate}
        />

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
            <Text style={styles.loadingText}>{i18n.t('tours.loadingDestinations')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{i18n.t('tours.errorLoadingDestinations')}</Text>
            <Button title={i18n.t('tours.retry')} onPress={() => dispatch(fetchBookmarksAsItems())} />
          </View>
        ) : (
          /* Item List or Empty State */
          selectedCities[selectedDay] ? (
              <ItemList
                  items={filteredItems}
                  selectedCity={selectedCities[selectedDay]}
                  selectedItems={selectedItemsByDay[selectedDay] || []}
                  totalSelectedCount={currentCitySelectedCount}  // <— OK
                  previouslySelectedItemIds={previouslySelectedItemIds}  // ← nouvel prop
                  onSelectItem={handleItemSelect}

              />
          ) : (
            <EmptyCity selectedDay={selectedDay} />
          )
        )}
      </View>

      <View style={styles.footer}>
        <Button 
          title={i18n.t('common.next')}
          onPress={handleNext}
          disabled={currentCitySelectedCount === 0 || loading}
        />
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepProgressContainer: {
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: '#E53935',
  },
});

export default AddNewTourDestinationsScreen; 