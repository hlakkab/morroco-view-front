import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import FilterPopup, { FilterOption } from "../components/FilterPopup";
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import BrokerListContainer from '../containers/BrokerListContainer';
import {
  brokerFilterCategories,
  createBrokerFilterOptions,
  normalizeString
} from '../data/filterData';
import { fetchBrokers, setSelectedLocation } from '../store/exchangeBrokerSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const BrokerListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  
  // Add icons to filter categories
  const categoriesWithIcons = {
    ...brokerFilterCategories,
    broker_city: {
      ...brokerFilterCategories.broker_city,
      icon: <Ionicons name="location" size={20} color="#CE1126" />
    },
    broker_type: {
      ...brokerFilterCategories.broker_type,
      icon: <Ionicons name="business" size={20} color="#CE1126" />
    }
  };

  // Get data from Redux store
  const {
    brokers,
    locations,
    selectedLocation,
    loading,
    error
  } = useAppSelector(state => state.exchangeBroker);

  // Initialize filter options
  useEffect(() => {
    if (filterOptions.length === 0) {
      setFilterOptions(createBrokerFilterOptions());
    }
  }, []);

  // Fetch brokers on component mount
  useEffect(() => {
    // Fetch brokers with default city (Marrakech)
    dispatch(fetchBrokers('Marrakech')).unwrap();
  }, [dispatch]);

  // Get active filters
  const activeCityFilters = filterOptions
    .filter(option => option.category === 'broker_city' && option.selected)
    .map(option => option.id);

  const activeTypeFilters = filterOptions
    .filter(option => option.category === 'broker_type' && option.selected)
    .map(option => option.id);

  // Filter brokers based on search query and filters
  const filteredBrokers = brokers.filter(broker => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(broker.name).includes(normalizeString(searchQuery)) ||
      normalizeString(broker.address).includes(normalizeString(searchQuery));
    
    // City filter - if no city is selected, show all
    const cityFilter = activeCityFilters.length === 0 ||
      activeCityFilters.includes(normalizeString(broker.city));
    
    // Type filter - if no type is selected, show all
    // For simplicity, we'll assume all brokers match the type filter
    // You can refine this based on your actual broker data structure
    const typeFilter = activeTypeFilters.length === 0;
    
    return searchMatch && cityFilter && typeFilter;
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterVisible(false);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterVisible(false);
    
    // If a city is selected in the filter, update the selected location
    const selectedCity = selectedOptions
      .find(option => option.category === 'broker_city' && option.selected);
    
    if (selectedCity) {
      // Find the matching location label from locations array
      const matchingLocation = locations.find(
        location => normalizeString(location) === selectedCity.id
      );
      
      if (matchingLocation) {
        dispatch(setSelectedLocation(matchingLocation));
      }
    }
  };

  const handleSelectLocation = (location: string) => {
    dispatch(setSelectedLocation(location));

    // If a specific city is selected (not "All Locations"), fetch brokers for that city
    if (location !== 'All Locations') {
      dispatch(fetchBrokers(location));
      
      // Update filter options to reflect the selected location
      setFilterOptions(prevOptions => 
        prevOptions.map(option => {
          if (option.category === 'broker_city') {
            return {
              ...option,
              selected: normalizeString(location) === option.id
            };
          }
          return option;
        })
      );
    } else {
      // If "All Locations" is selected, fetch all brokers
      dispatch(fetchBrokers());
      
      // Clear city selections in filter
      setFilterOptions(prevOptions => 
        prevOptions.map(option => {
          if (option.category === 'broker_city') {
            return { ...option, selected: false };
          }
          return option;
        })
      );
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Loading brokers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load brokers</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
      </View>

      <View style={styles.content}>
        <SearchBar
          placeholder="Search for brokers..."
          onChangeText={handleSearch}
          onFilterPress={handleFilterPress}
          value={searchQuery}
        />

        <BrokerListContainer
          brokers={filteredBrokers}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
        />

        <FilterPopup
          visible={filterVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filter Brokers"
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
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
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default BrokerListScreen;