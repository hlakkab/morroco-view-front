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

const EntertainmentScreenVo: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('all');

  const { entertainments, loading, error } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

  // Map to align API city codes with city names for filtering
  const cityCodes: Record<string, string> = {
    '5408': 'marrakech',
    '4396': 'casablanca',
    '4388': 'tangier',
  };

  // Reverse map for going from city name to code
  const cityNameToCodes: Record<string, string> = {
    'marrakech': '5408',
    'casablanca': '4396',
    'tangier': '4388',
  };

  // Add icons to filter categories - only for location
  const categoriesWithIcons = {
    location: {
      key: 'location',
      label: 'By Location',
      icon: <Ionicons name="navigate" size={20} color="#CE1126" />
    }
  };

  // Create city options for FilterSelector
  const cityOptions = [
    { 
      id: 'all', 
      label: 'All Cities', 
      icon: <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 4 }} /> 
    },
    ...cities
      .filter(city => ['casablanca', 'marrakech', 'tangier'].includes(normalizeString(city.id)))
      .map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        icon: <Ionicons name="location-outline" size={16} color="#888" style={{ marginRight: 4 }} />
      }))
  ];

  // Initialize filter options - only for location filter, not cities
  useEffect(() => {
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

      setFilterOptions(locationOptions);
    }
  }, [entertainments]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    
    // Fetch entertainments with the selected city code
    if (cityId === 'all') {
      // Default to Marrakech when "All Cities" is selected
      fetchEntertainmentData('5408');
    } else {
      // Get the corresponding city code for the API
      const cityCode = cityNameToCodes[cityId] || '5408';
      fetchEntertainmentData(cityCode);
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
    fetchEntertainmentData('5408');
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
  };

  // Get active location filters
  const activeLocationFilters = filterOptions
    .filter(option => option.category === 'location' && option.selected)
    .map(option => option.id);

  // Filter entertainments based on search and location (city filtering is handled by the API)
  const filteredEntertainments = entertainments.filter((ent: Entertainment) => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(ent.title).includes(normalizeString(searchQuery));
    
    // Location filter - if no location is selected, show all
    const locationMatch = activeLocationFilters.length === 0 || 
      (ent.location && activeLocationFilters.includes(normalizeString(ent.location)));
    
    return searchMatch && locationMatch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader title="Entertainment" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CE1126" />
          <Text style={styles.loadingText}>Loading entertainments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader title="Entertainment" />
        </View>
        <View style={styles.errorContainer}>
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
        <View style={styles.cityFilterContainer}>
          <FilterSelector
            options={cityOptions}
            selectedOptionId={selectedCityId}
            onSelectOption={handleCitySelect}
            title="City :"
          />
        </View>
        <EntertainmentListContainerVo entertainments={filteredEntertainments} />
      </View>

      {/* Filter Popup with location filters only */}
      <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filter Entertainment"
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
  cityFilterContainer: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
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
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default EntertainmentScreenVo;
