import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMonuments, setSelectedMonumentType } from '../store/index';

// Import custom components
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import SearchBar from '../components/SearchBar';
import MonumentListContainer from '../containers/MonumentListContainer';

// Import types
import ButtonFixe from '../components/ButtonFixe';
import ScreenHeader from '../components/ScreenHeader';
import {
  createMonumentFilterOptions,
  monumentFilterCategories,
  normalizeString
} from '../data/filterData';
import { Monument, MonumentType } from '../types/Monument';
import { RootStackParamList } from '../types/navigation';

type MonumentsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Monuments'>;

const MonumentsScreen: React.FC = () => {
  const navigation = useNavigation<MonumentsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    monuments, 
    loading, 
    error, 
    selectedType 
  } = useAppSelector(state => state.monument);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  // Add icons to filter categories
  const categoriesWithIcons = {
    ...monumentFilterCategories,
    monument_city: {
      ...monumentFilterCategories.monument_city,
      icon: <Ionicons name="location" size={20} color="#CE1126" />
    },
    // Commenting out the monument type filter for now
    // monument_type: {
    //   ...monumentFilterCategories.monument_type,
    //   icon: <Ionicons name="business" size={20} color="#CE1126" />
    // }
  };

  // Initialize filter options (excluding monument type)
  useEffect(() => {
    if (filterOptions.length === 0) {
      // Get all filter options but only use city options
      const allOptions = createMonumentFilterOptions();
      const cityOptions = allOptions.filter(option => option.category === 'monument_city');
      setFilterOptions(cityOptions);
    }
  }, []);

  // Fetch monuments when component mounts
  useEffect(() => {
    dispatch(fetchMonuments());
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

    // Comment out the type filter logic
    // // Find selected monument type filter if any
    // const selectedMonumentType = selectedOptions.find(
    //   option => option.category === 'monument_type' && option.selected
    // );

    // // Update the Redux store with the selected type if a type is selected
    // if (selectedMonumentType) {
    //   const typeValue = selectedMonumentType.id.charAt(0).toUpperCase() + selectedMonumentType.id.slice(1);
    //   dispatch(setSelectedMonumentType(typeValue as MonumentType | 'All'));
    // } else {
    //   // Reset to All if no type is selected
    //   dispatch(setSelectedMonumentType('All'));
    // }
  };

  // Get active filters
  const activeCityFilters = filterOptions
    .filter(option => option.category === 'monument_city' && option.selected)
    .map(option => option.id);

  // Comment out the type filters
  // const activeTypeFilters = filterOptions
  //   .filter(option => option.category === 'monument_type' && option.selected)
  //   .map(option => option.id);

  const handleTypeSelection = (type: MonumentType | 'All Types') => {
    // Convert 'All Types' to 'All' to match our Redux state type
    const reduxType = type === 'All Types' ? 'All' : type;
    dispatch(setSelectedMonumentType(reduxType));

    // Comment out the filter options update
    // // Update filter options to reflect the selected type
    // if (type !== 'All Types') {
    //   setFilterOptions(prevOptions =>
    //     prevOptions.map(option => {
    //       if (option.category === 'monument_type') {
    //         return {
    //           ...option,
    //           selected: normalizeString(type) === option.id
    //         };
    //       }
    //       return option;
    //     })
    //   );
    // } else {
    //   // Clear type selections in filter
    //   setFilterOptions(prevOptions =>
    //     prevOptions.map(option => {
    //       if (option.category === 'monument_type') {
    //         return { ...option, selected: false };
    //       }
    //       return option;
    //     })
    //   );
    // }
  };

  // Apply search and city filters on top of type filter
  const filteredMonuments = monuments.filter(monument => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(monument.name).includes(normalizeString(searchQuery)) ||
      (monument.description && normalizeString(monument.description).includes(normalizeString(searchQuery))) ||
      normalizeString(monument.address).includes(normalizeString(searchQuery));
    
    // City filter - if no city is selected, show all
    const cityFilter = activeCityFilters.length === 0 ||
      activeCityFilters.includes(normalizeString(monument.city));
    
    // Type filter is already handled by the Redux state and MonumentListContainer
    
    return searchMatch && cityFilter;
  });

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Monuments" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008060" />
          <Text style={styles.loadingText}>Loading monuments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Monuments" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <ButtonFixe 
            title="Try Again" 
            onPress={() => dispatch(fetchMonuments())} 
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Monuments" />
      </View>
      <View style={styles.content}>
        <SearchBar
          placeholder="Search monuments..."
          onChangeText={handleSearch}
          value={searchQuery}
          onFilterPress={handleFilterPress}
        />

        <MonumentListContainer
          monuments={filteredMonuments}
          selectedType={selectedType === 'All' ? 'All Types' : selectedType}
          onSelectType={handleTypeSelection}
        />

        <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filter Monuments"
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

export default MonumentsScreen; 