import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import i18n from '../translations/i18n';

// Import Redux hooks and actions
import { fetchArtisans, setSelectedType } from '../store/artisanSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

// Import custom components
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import FilterSelector from '../components/FilterSelector';
import SearchBar from '../components/SearchBar';
import ArtisanListContainer from '../containers/ArtisanListContainer';

// Import types
import ButtonFixe from '../components/ButtonFixe';
import ScreenHeader from '../components/ScreenHeader';
import {
  artisanFilterCategories,
  cities,
  createArtisanFilterOptions,
  normalizeString
} from '../data/filterData';
import { Artisan, ArtisanType } from '../types/Artisan';
import { RootStackParamList } from '../types/navigation';

type ArtisansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Artisans'>;

const ArtisansScreen: React.FC = () => {
  const navigation = useNavigation<ArtisansScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    artisans, 
    loading, 
    error, 
    selectedType 
  } = useAppSelector(state => state.artisan);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCity, setSelectedCity] = useState('all');

  // Add icons to filter categories - only include artisan_type for FilterPopup
  const categoriesWithIcons = {
    artisan_type: {
      ...artisanFilterCategories.artisan_type,
      icon: <Ionicons name="hand-left" size={20} color="#CE1126" />
    }
  };

  // Initialize filter options (only for artisan_type)
  useEffect(() => {
    if (filterOptions.length === 0) {
      // Get all filter options but only use type options
      const allOptions = createArtisanFilterOptions();
      const typeOptions = allOptions.filter(option => option.category === 'artisan_type');
      setFilterOptions(typeOptions);
    }
  }, []);

  // Fetch artisans when component mounts
  useEffect(() => {
    dispatch(fetchArtisans());
  }, [dispatch]);

  // Create city options for FilterSelector
  const cityOptions = [
    { 
      id: 'all', 
      label: i18n.t('artisans.allCities'), 
      icon: <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 4 }} /> 
    },
    ...cities.map(city => ({
      id: normalizeString(city.id),
      label: city.label,
      icon: <Ionicons name="location-outline" size={16} color="#888" style={{ marginRight: 4 }} />
    }))
  ];

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

    // Find selected artisan type filter if any
    const selectedArtisanType = selectedOptions.find(
      option => option.category === 'artisan_type' && option.selected
    );

    // Update the Redux store with the selected type if a type is selected
    if (selectedArtisanType) {
      // Convert the normalized id back to proper ArtisanType format
      const selectedTypeId = selectedArtisanType.id;
      const matchingType = Object.values(ArtisanType).find(
        type => normalizeString(type) === selectedTypeId
      );
      
      if (matchingType) {
        dispatch(setSelectedType(matchingType as ArtisanType));
      }
    } else {
      // Reset to All if no type is selected
      dispatch(setSelectedType('All'));
    }
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
  };

  // Get active type filters
  const activeTypeFilters = filterOptions
    .filter(option => option.category === 'artisan_type' && option.selected)
    .map(option => option.id);

  // Handler for type selection from ArtisanListContainer
  const handleTypeSelection = (type: ArtisanType | 'All Types') => {
    // Convert 'All Types' to 'All' to match our Redux state type
    const reduxType = type === 'All Types' ? 'All' : type;
    dispatch(setSelectedType(reduxType));
    
    // Update filter options to reflect the selected type
    setFilterOptions(prevOptions =>
      prevOptions.map(option => {
        if (option.category === 'artisan_type') {
          return {
            ...option,
            selected: normalizeString(type) === option.id
          };
        }
        return option;
      })
    );
  };

  // Apply search and city filters
  const filteredArtisans = artisans.filter(artisan => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(artisan.name).includes(normalizeString(searchQuery)) ||
      (artisan.description && normalizeString(artisan.description).includes(normalizeString(searchQuery))) ||
      normalizeString(artisan.address).includes(normalizeString(searchQuery));
    
    // City filter
    const cityFilter = selectedCity === 'all' ||
      normalizeString(artisan.city) === selectedCity;
    
    return searchMatch && cityFilter;
  });

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={i18n.t('artisans.title')} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CE1126" />
          <Text style={styles.loadingText}>{i18n.t('artisans.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={i18n.t('artisans.title')} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <ButtonFixe 
            title={i18n.t('artisans.tryAgain')} 
            onPress={() => dispatch(fetchArtisans())} 
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('artisans.title')} />
      </View>
      <View style={styles.content}>
        <SearchBar
          placeholder={i18n.t('artisans.searchPlaceholder')}
          onChangeText={handleSearch}
          value={searchQuery}
          onFilterPress={handleFilterPress}
        />

        <View style={styles.cityFilterContainer}>
          <FilterSelector
            options={cityOptions}
            selectedOptionId={selectedCity}
            onSelectOption={handleCitySelect}
            title={i18n.t('artisans.city')}
          />
        </View>

        <ArtisanListContainer
          artisans={filteredArtisans}
          selectedType={selectedType === 'All' ? 'All Types' : selectedType}
          onSelectType={handleTypeSelection}
          showTypeFilter={false}
        />

        <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title={i18n.t('artisans.filterTitle')}
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
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#CE1126',
    width: 150,
  },
});

export default ArtisansScreen; 