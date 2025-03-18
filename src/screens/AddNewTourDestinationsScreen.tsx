import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import CardItem from '../components/cards/CardItem';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import StepProgress from '../components/StepProgress';
import { RootStackParamList } from '../types/navigation';

interface SavedItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  city: string;
}

const AddNewTourDestinationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddNewTourDestinations'>>();
  const { title, startDate, endDate } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedCities, setSelectedCities] = useState<Record<number, string>>({
    1: 'Casablanca',
    2: 'Casablanca',
    3: 'Casablanca'
  });
  
  // Map of selected items by day
  const [selectedItemsByDay, setSelectedItemsByDay] = useState<Record<number, string[]>>({
    1: [],
    2: [],
    3: []
  });

  // Calculate number of days in the tour
  const [totalDays, setTotalDays] = useState(3);

  useEffect(() => {
    if (startDate && endDate) {
      // This is a placeholder calculation - you'd use a proper date library in production
      // Here we're assuming the format is already correct and just calculating days
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(days > 0 ? days : 3);
        
        // Initialize selected cities and items for all days
        const initialCities: Record<number, string> = {};
        const initialSelectedItems: Record<number, string[]> = {};
        
        for (let i = 1; i <= days; i++) {
          initialCities[i] = 'Casablanca';
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

  // Example cities
  const cities = ['Casablanca', 'Rabat', 'Agadir'];

  // Example saved items with simpler, more reliable image URLs
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

  const handleStepPress = (stepIndex: number) => {
    if (stepIndex < 1) { // Only allow going back to previous steps
      navigation.goBack();
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemsByDay(prev => {
      const currentDayItems = [...prev[selectedDay]];
      
      if (currentDayItems.includes(itemId)) {
        return {
          ...prev,
          [selectedDay]: currentDayItems.filter(id => id !== itemId)
        };
      }
      
      return {
        ...prev,
        [selectedDay]: [...currentDayItems, itemId]
      };
    });
  };

  const handleCityChange = (city: string) => {
    setSelectedCities(prev => ({
      ...prev,
      [selectedDay]: city
    }));
  };

  const handleNext = () => {
    // Navigate to the next step with all the collected data
    console.log('Tour plan:', {
      title,
      startDate,
      endDate,
      days: selectedItemsByDay,
      cities: selectedCities
    });
    
    // Navigate to the third step
    // navigation.navigate('AddNewTourOrganize', { ... });
  };

  // Filter items by selected city and search query
  const filteredItems = savedItems.filter(item => {
    const matchesCity = item.city === selectedCities[selectedDay];
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCity && matchesSearch;
  });

  const renderSavedItem = ({ item }: { item: SavedItem }) => {
    const isSelected = selectedItemsByDay[selectedDay].includes(item.id);

    return (
      <View style={styles.cardContainer}>
        <CardItem
          imageUrl={item.imageUrl}
          title={item.title}
          subtitle={item.subtitle}
          tags={[
            {
              id: item.type,
              label: item.type.charAt(0).toUpperCase() + item.type.slice(1),
              icon: getIconForType(item.type)
            }
          ]}
          actionIcon={
            <Ionicons
              name={isSelected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={32}
              color={isSelected ? "#E53935" : "#666"}
            />
          }
          onActionPress={() => handleItemSelect(item.id)}
          containerStyle={styles.card}
          imageStyle={styles.cardImage}
        />
      </View>
    );
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'hotel':
        return <Ionicons name="bed-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'restaurant':
        return <Ionicons name="restaurant-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'match':
        return <Ionicons name="football-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'entertainment':
        return <Ionicons name="musical-notes-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      default:
        return <Ionicons name="location-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
    }
  };

  const totalSelectedCount = Object.values(selectedItemsByDay).reduce(
    (count, items) => count + items.length, 0
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Add New Tour" />
      
        <View style={styles.stepProgressContainer}>
          <StepProgress 
            steps={steps} 
            currentStep={1}
            onStepPress={handleStepPress}
          />
        </View>

        <SearchBar
          placeholder="Search for ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {}}
        />
      <View style={styles.content}>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          <Text style={styles.daySelectorTitle}>Day:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScrollView}>
            {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
              <TouchableOpacity
                key={`day-${day}`}
                style={[
                  styles.dayButton,
                  selectedDay === day && styles.selectedDayButton
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  selectedDay === day && styles.selectedDayButtonText
                ]}>
                  Day {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* City Selector */}
        <View style={styles.citySelector}>
          <Text style={styles.citySelectorTitle}>City for Day {selectedDay}:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScrollView}>
            {cities.map(city => (
              <TouchableOpacity
                key={`city-${city}`}
                style={[
                  styles.cityButton,
                  selectedCities[selectedDay] === city && styles.selectedCityButton
                ]}
                onPress={() => handleCityChange(city)}
              >
                <Ionicons 
                  name="location-outline" 
                  size={16} 
                  color={selectedCities[selectedDay] === city ? '#fff' : '#888'} 
                  style={{ marginRight: 4 }} 
                />
                <Text style={[
                  styles.cityButtonText,
                  selectedCities[selectedDay] === city && styles.selectedCityButtonText
                ]}>
                  {city}
                </Text>
                {selectedCities[selectedDay] === city && (
                  <Ionicons name="checkmark" size={16} color="#fff" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>Saved Listing</Text>
          <Text style={styles.selectedCount}>{totalSelectedCount} selected</Text>
        </View>

        <FlatList
          data={filteredItems}
          renderItem={renderSavedItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found for this city</Text>
            </View>
          }
        />
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepProgressContainer: {
  },
  daySelector: {
  },
  daySelectorTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  dayScrollView: {
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedDayButton: {
    backgroundColor: '#E53935',
    borderColor: '#E53935',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedDayButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  citySelector: {
    marginTop: 12,
  },
  citySelectorTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  cityScrollView: {
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
  cityButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCityButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  savedSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedCount: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    resizeMode: 'cover',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 16,
  },
});

export default AddNewTourDestinationsScreen; 