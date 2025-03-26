import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import FilterSelector from '../components/FilterSelector';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';
import { cities, normalizeString } from '../data/filterData';
import { EntertainmentState, fetchEntertainments } from '../store/entertainmentSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Entertainment } from '../types/Entertainment';
import { RootStackParamList } from '../types/navigation';

type EntertainmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entertainment'>;

// Define all available cities to show in the filter popup
const ALL_CITIES = cities.map(city => ({
  id: normalizeString(city.id),
  label: city.label
}));

const EntertainmentScreenVo: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const [selectedCityId, setSelectedCityId] = useState('5408');

  const { entertainments, loading, error } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

  // City filter options for dropdown selector
  const cityFilterOptions = [
    { id: '5408', label: 'Marrakech' },
    { id: '4396', label: 'Casablanca' },
    { id: '4388', label: 'Tangier'},
  ];

  // Map to align API city codes with city names for filtering
  const cityCodes: Record<string, string> = {
    '5408': 'marrakech',
    '4396': 'casablanca',
    '4388': 'tangier',
  };

  // Add icons to filter categories
  const categoriesWithIcons = {
    entertainment_city: {
      key: 'entertainment_city',
      label: 'By City',
      icon: <Ionicons name="location" size={20} color="#CE1126" />
    },
    location: {
      key: 'location',
      label: 'By Location',
      icon: <Ionicons name="navigate" size={20} color="#CE1126" />
    }
  };

  // Initialize filter options
  useEffect(() => {
    // Create city filter options for all cities
    const cityOptions = ALL_CITIES.map(city => ({
      id: city.id,
      label: city.label,
      selected: selectedCityId !== 'all' ? normalizeString(cityCodes[selectedCityId]) === city.id : false,
      category: 'entertainment_city'
    }));

    if (entertainments.length > 0) {
      // Create location filter options from the actual data
      const uniqueLocations = Array.from(new Set(entertainments
        .filter(ent => ent.location && ent.location.trim() !== '')
        .map(ent => ent.location)));
      
      const locationOptions = uniqueLocations.map(location => ({
        id: normalizeString(location),
        label: location,
        selected: false,
        category: 'location'
      }));

      setFilterOptions([...cityOptions, ...locationOptions]);
    } else {
      // If no entertainments yet, still show city options
      setFilterOptions(cityOptions);
    }
  }, [entertainments, selectedCityId]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    
    // Update filter options to match the selected city in dropdown
    if (cityId !== 'all') {
      setFilterOptions(prevOptions => 
        prevOptions.map(option => {
          if (option.category === 'entertainment_city') {
            return {
              ...option,
              selected: normalizeString(cityCodes[cityId]) === option.id
            };
          }
          return option;
        })
      );
    } else {
      // Reset city filters when "all" is selected
      setFilterOptions(prevOptions => 
        prevOptions.map(option => {
          if (option.category === 'entertainment_city') {
            return {
              ...option,
              selected: false
            };
          }
          return option;
        })
      );
    }
    
    // Fetch entertainments with the selected city code
    if (cityId === 'all') {
      fetchEntertainmentData();
    } else {
      fetchEntertainmentData(cityId);
    }
  };

  const fetchEntertainmentData = async (cityCode?: string) => {
    try {
      await dispatch(fetchEntertainments(cityCode || '5408')).unwrap();
    } catch (error) {
      console.error('Failed to fetch entertainments:', error);
    }
  };

  useEffect(() => {
    // Initial data fetch with default city
    fetchEntertainmentData();
  }, [dispatch]);

  const handleFilterPress = () => {
    setFilterPopupVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterPopupVisible(false);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
    
    // Check if any city is selected in the popup
    const selectedCity = selectedOptions.find(
      option => option.category === 'entertainment_city' && option.selected
    );
    
    // Update the dropdown selector to match the popup selection
    if (selectedCity) {
      // Find the corresponding city code for the API
      const cityCode = Object.entries(cityCodes).find(
        ([code, cityName]) => normalizeString(cityName) === selectedCity.id
      )?.[0];
      
      if (cityCode) {
        setSelectedCityId(cityCode);
        fetchEntertainmentData(cityCode);
      }
    } else {
      // If no city is selected in the popup, reset to showing all
      setSelectedCityId('all');
      fetchEntertainmentData();
    }
  };

  // Get active filters
  const activeLocationFilters = filterOptions
    .filter(option => option.category === 'location' && option.selected)
    .map(option => option.id);

  const activeCityFilters = filterOptions
    .filter(option => option.category === 'entertainment_city' && option.selected)
    .map(option => option.id);

  // Filter entertainments based on search and location (city filtering is handled by the API)
  const filteredEntertainments = entertainments.filter((ent: Entertainment) => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(ent.title).includes(normalizeString(searchQuery));
    
    // Location filter - if no location is selected, show all
    const locationMatch = activeLocationFilters.length === 0 || 
      (ent.location && activeLocationFilters.includes(normalizeString(ent.location)));
    
    // City filtering is primarily handled by the API, but we can apply additional filtering if needed
    // This is just for the local UI filtering if we need to narrow down further
    const cityMatch = true; // We already filtered by city in the API call
    
    return searchMatch && locationMatch && cityMatch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Entertainment" />
      </View>
      <View style={styles.content}>
        <SearchBar
            placeholder="Search entertainments..."
            onChangeText={handleSearch}
            value={searchQuery}
            onFilterPress={handleFilterPress}
        />
        <View style={styles.filterContainer}>
          {/* <FilterSelector
            options={cityFilterOptions}
            selectedOptionId={selectedCityId}
            onSelectOption={handleSelectCity}
            title="Filter by City"
          /> */}
        </View>
        <EntertainmentListContainerVo entertainments={filteredEntertainments} />
      </View>

      {/* Filter Popup with both city and location filters */}
      <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filter Entertainments"
          categories={categoriesWithIcons}
      />
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  filterContainer: {
    marginBottom: 8,
  },
});

export default EntertainmentScreenVo;
