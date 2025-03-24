import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRestaurants, setSelectedRestaurantType } from '../store/index';

// Import custom components
import HeaderContainer from '../containers/HeaderContainer';
import SearchBar from '../components/SearchBar';
import RestaurantListContainer from '../containers/RestaurantListContainer';
import FilterPopup, { FilterOption } from '../components/FilterPopup'; // Importer FilterPopup

// Import types
import { RootStackParamList } from '../types/navigation';
import { Restaurant, RestaurantType } from '../types/Restaurant';
import ScreenHeader from '../components/ScreenHeader';
import ButtonFixe from '../components/ButtonFixe';

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

  // Fetch restaurants when component mounts
  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  // État pour gérer la visibilité du popup de filtres
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);

// Options de filtres pour le popup


  const [filterOptions, setFilterOptions] = useState<FilterOption[]>(() => {
    // Extraire toutes les villes uniques des données
   // const uniqueCities = [...new Set(SAMPLE_RESTAURANTS.map(restaurant => restaurant.city))];

    return [
     /* // Options pour le type de restaurant
      ...Object.values(RestaurantType).map(type => ({
        id: type,
        label: type,
        selected: selectedType === type,
        category: 'type'
      })),*/
      // Options pour les villes
     /* ...uniqueCities.map(city => ({
        id: city,
        label: city,
        selected: false,
        category: 'city'
      }))*/
    ];
  });

  // Mettre à jour les options de filtre lorsque selectedType change
  useEffect(() => {
    setFilterOptions(prevOptions =>
        prevOptions.map(option => {
          if (option.category === 'type') {
            return {
              ...option,
              selected: selectedType === option.id
            };
          }
          return option;
        })
    );
  }, [selectedType]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleTypeSelection = (type: RestaurantType | 'All Types') => {
    // Convert 'All Types' to 'All' to match our Redux state type
    const reduxType = type === 'All Types' ? 'All' : type;
    dispatch(setSelectedRestaurantType(reduxType));
  };

  // Apply search filter on top of type filter
  const searchFilteredRestaurants = searchQuery.trim() === ''
    ? restaurants
    : restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

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

 // console.log(restaurants.map(restaurant => restaurant.saved));

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
          onFilterPress={() => {}}
        />

        <RestaurantListContainer
          restaurants={restaurants}
          selectedType={selectedType === 'All' ? 'All Types' : selectedType}
          onSelectType={handleTypeSelection}
        />
      </View>
      {/* </View>
      <View style={styles.listContainer}>
        <RestaurantListContainer
          restaurants={searchFilteredRestaurants}
          selectedType={selectedType === 'All' ? 'All Types' : selectedType}
          onSelectType={handleTypeSelection}
        />
      </View> */}
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