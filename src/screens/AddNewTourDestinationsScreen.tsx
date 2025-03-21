import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import StepProgress from '../components/StepProgress';
import CitySelector from '../components/tour/CitySelector';
import DaySelector from '../components/tour/DaySelector';
import EmptyCity from '../components/tour/EmptyCity';
import ItemList, { SavedItem } from '../containers/tour/ItemList';
import { RootStackParamList } from '../types/navigation';
import TourFlowHeader from '../components/tour/TourFlowHeader';

const AddNewTourDestinationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNewTourDestinations'>>();
  const { title, startDate, endDate } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedCities, setSelectedCities] = useState<Record<number, string>>({});
  const [selectedItemsByDay, setSelectedItemsByDay] = useState<Record<number, string[]>>({});
  const [totalDays, setTotalDays] = useState(3);

  // Example cities
  const cities = ['Casablanca', 'Rabat', 'Agadir'];

  // Example saved items
  const savedItems: SavedItem[] = [
    {
      id: '1',
      type: 'hotel',
      title: 'Four Seasons Hotel',
      subtitle: 'Anfa Place Living Resort, Boulevard de la...',
      imageUrl: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/223648290.jpg?k=d7042c5905373d5f217992f67cfb1a1a5a5559a0a2ad4b3ce7536e2848a1bc37&o=&hp=1',
      city: 'Casablanca'
    },
    {
      id: '2',
      type: 'restaurant',
      title: 'Kōya Restaurant Lounge',
      subtitle: '408 Bd Driss Slaoui, Casablanca',
      imageUrl: 'https://media-cdn.tripadvisor.com/media/photo-p/1c/cc/51/db/koya.jpg',
      city: 'Casablanca'
    },
    {
      id: '3',
      type: 'match',
      title: 'Morocco Vs. Comoros',
      subtitle: 'Stade Moulay Abdallah',
      imageUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
      city: 'Rabat'
    },
    {
      id: '4',
      type: 'entertainment',
      title: 'Chellah Jazz Festival',
      subtitle: 'Chellah Necropolis',
      imageUrl: 'https://images.pexels.com/photos/4062561/pexels-photo-4062561.jpeg',
      city: 'Rabat'
    },
    {
      id: '5',
      type: 'hotel',
      title: 'Sofitel Agadir Royal Bay',
      subtitle: 'Baie des Palmiers, Agadir',
      imageUrl: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg',
      city: 'Agadir'
    },
    {
      id: '6',
      type: 'restaurant',
      title: 'Le Jardin d\'Eau',
      subtitle: 'Marina, Agadir',
      imageUrl: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg',
      city: 'Agadir'
    },
    {
      id: '7',
      type: 'match',
      title: 'Egypt Vs. Ghana',
      subtitle: 'Stade Adrar',
      imageUrl: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
      city: 'Agadir'
    }
  ];

  const steps = [
    { id: '01', label: 'Basic infos' },
    { id: '02', label: 'Destinations' },
    { id: '03', label: 'Organize' },
  ];

  useEffect(() => {
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(days > 0 ? days : 3);
        
        // Initialize selected cities and items for all days
        const initialCities: Record<number, string> = {};
        const initialSelectedItems: Record<number, string[]> = {};
        
        for (let i = 1; i <= days; i++) {
          initialCities[i] = ''; // Start with no selected city
          initialSelectedItems[i] = [];
        }
        
        setSelectedCities(initialCities);
        setSelectedItemsByDay(initialSelectedItems);
      } catch (e) {
        console.error("Error calculating days:", e);
        setTotalDays(3); // Default to 3 days on error
      }
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
        "Change City?",
        `Changing the city will remove all selected items for Day ${selectedDay}. Do you want to continue?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Change City",
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
        "No Destinations Selected",
        "Please select at least one destination for your tour."
      );
      return;
    }
    
    // Navigate to the third step
    navigation.navigate('AddNewTourOrganize', {
      title,
      startDate,
      endDate,
      selectedItemsByDay,
      cities: selectedCities,
      savedItems: savedItems
    });
  };

  // Filter items by selected city and search query
  const filteredItems = useMemo(() => {
    return savedItems.filter(item => {
      // If a city is selected for the current day, only show items from that city
      const selectedCity = selectedCities[selectedDay];
      const matchesCity = selectedCity ? item.city === selectedCity : true;
      
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCity && matchesSearch;
    });
  }, [savedItems, selectedCities, selectedDay, searchQuery]);

  const totalSelectedCount = useMemo(() => {
    return Object.values(selectedItemsByDay).reduce(
      (count, items) => count + items.length, 0
    );
  }, [selectedItemsByDay]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TourFlowHeader title="Add New Tour" />
      </View>
      
      <View style={styles.stepProgressContainer}>
        <StepProgress 
          steps={steps} 
          currentStep={1}
          onStepPress={handleStepPress}
        />
      </View>

      <View style={styles.content}>
        <SearchBar
          placeholder="Search for ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {}}
        />

        {/* Day Selector Component */}
        <DaySelector
          totalDays={totalDays}
          selectedDay={selectedDay}
          getDayStatus={getDayStatus}
          onSelectDay={setSelectedDay}
        />

        {/* City Selector Component */}
        <CitySelector
          cities={cities}
          selectedCity={selectedCities[selectedDay] || ''}
          selectedDay={selectedDay}
          isLocked={isCityLockedForCurrentDay}
          onCityChange={handleCityChange}
        />

        {/* Item List or Empty State */}
        {selectedCities[selectedDay] ? (
          <ItemList
            items={filteredItems}
            selectedCity={selectedCities[selectedDay]}
            selectedItems={selectedItemsByDay[selectedDay] || []}
            totalSelectedCount={totalSelectedCount}
            onSelectItem={handleItemSelect}
          />
        ) : (
          <EmptyCity selectedDay={selectedDay} />
        )}
      </View>

      <View style={styles.footer}>
        <Button 
          title="Next"
          onPress={handleNext}
          disabled={totalSelectedCount === 0}
        />
      </View>
    </SafeAreaView>
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
});

export default AddNewTourDestinationsScreen; 