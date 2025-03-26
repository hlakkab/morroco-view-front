import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRestaurants, setSelectedRestaurantType } from '../store/index';

// Import custom components
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import SearchBar from '../components/SearchBar';
import HeaderContainer from '../containers/HeaderContainer';
import RestaurantListContainer from '../containers/RestaurantListContainer';

// Import types
import ButtonFixe from '../components/ButtonFixe';
import ScreenHeader from '../components/ScreenHeader';
import { cities, normalizeString } from '../data/filterData';
import { RootStackParamList } from '../types/navigation';
import { Restaurant, RestaurantType } from '../types/Restaurant';

type RestaurantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Restaurant'>;

const RestaurantScreen: React.FC = () => {
  const navigation = useNavigation<RestaurantScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    restaurants, 
    loading, 
    error, 
    selectedType 
  } = useAppSelector(state => state.restaurant);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  // Add icons to filter categories
  const categoriesWithIcons = {
    restaurant_city: {
      key: 'restaurant_city',
      label: 'By City',
      icon: <Ionicons name="location" size={20} color="#CE1126" />
    }
  };

  // Initialize filter options
  useEffect(() => {
    if (filterOptions.length === 0 && restaurants.length > 0) {
      // Create city filter options
      const cityOptions = cities.map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        selected: false,
        category: 'restaurant_city'
      }));
      
      setFilterOptions(cityOptions);
    }
  }, [restaurants]);

  // Fetch restaurants when component mounts
  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    setFilterPopupVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterPopupVisible(false);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
  };

  const handleTypeSelection = (type: RestaurantType | 'All Types') => {
    // Convert 'All Types' to 'All' to match our Redux state type
    const reduxType = type === 'All Types' ? 'All' : type;
    dispatch(setSelectedRestaurantType(reduxType));
  };

  // Get active city filters
  const activeCityFilters = filterOptions
    .filter(option => option.category === 'restaurant_city' && option.selected)
    .map(option => option.id);

  // Apply search and city filters 
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(restaurant.name).includes(normalizeString(searchQuery)) ||
      normalizeString(restaurant.address).includes(normalizeString(searchQuery));
    
    // City filter - if no city is selected, show all
    const cityFilter = activeCityFilters.length === 0 ||
      (restaurant.city && activeCityFilters.includes(normalizeString(restaurant.city)));
    
    return searchMatch && cityFilter;
  });

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Restaurants" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008060" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Restaurants" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <ButtonFixe 
            title="Try Again" 
            onPress={() => dispatch(fetchRestaurants())} 
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Restaurants" />
      </View>
      <View style={styles.content}>
        <SearchBar
          placeholder="Search restaurants..."
          onChangeText={handleSearch}
          value={searchQuery}
          onFilterPress={handleFilterPress}
        />

        <RestaurantListContainer
          restaurants={filteredRestaurants}
          selectedType={selectedType === 'All' ? 'All Types' : selectedType}
          onSelectType={handleTypeSelection}
        />

        <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filter Restaurants"
          categories={categoriesWithIcons}
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#008060',
    width: 150,
  },
});

export default RestaurantScreen;