import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import FilterPopup, { FilterOption } from '../components/FilterPopup';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import HotelPickupListContainer from '../containers/HotelPickupListContainer';
import { useLanguage } from '../contexts/LanguageContext';
import {
  createPickupFilterOptions,
  normalizeString,
  pickupFilterCategories
} from '../data/filterData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHotelPickups, setSearchQuery, setSelectedFromCity, setSelectedToCity } from '../store/hotelPickupSlice';
import i18n from '../translations/i18n';

const CITIES = ['Marrakech', 'Rabat', 'Agadir', 'Casablanca', 'Fez', 'Tangier'];

const HotelPickupScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { currentLanguage } = useLanguage();
  const {
    hotelPickups,
    selectedFromCity,
    selectedToCity,
    searchQuery,
    loading,
    error
  } = useAppSelector((state) => state.hotelPickup);

  const [useSampleData, setUseSampleData] = useState(false);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  // Add icons to filter categories
  const categoriesWithIcons = {
    ...pickupFilterCategories,
    pickup_type: {
      ...pickupFilterCategories.pickup_type,
      icon: <Ionicons name="car" size={20} color="#CE1126" />
    }
  };

  // Initialize filter options for pickup types
  useEffect(() => {
    if (filterOptions.length === 0) {
      setFilterOptions(createPickupFilterOptions());
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchHotelPickups(selectedFromCity)).unwrap();
      } catch (error) {
        console.error('Failed to fetch hotel pickups:', error);
        setUseSampleData(true);
      }
    };

    fetchData();
  }, [dispatch, selectedFromCity]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleFilter = () => {
    setFilterPopupVisible(true);
  };

  const handleSelectCity = (city: string, type: 'from' | 'to') => {
    if (type === 'from') {
      dispatch(setSelectedFromCity(city));
    } else {
      dispatch(setSelectedToCity(city));
    }
  };

  // Function to apply selected filters
  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
  };

  // Get active pickup type filters
  const activePickupTypeFilters = filterOptions
    .filter(option => option.category === 'pickup_type' && option.selected)
    .map(option => option.id);

  // Filter pickups based on search and pickup type filters
  const filteredPickups = hotelPickups.filter(pickup => {
    // Search match
    const searchMatch = normalizeString(pickup.title).includes(normalizeString(searchQuery));

    // Pickup type filter
    const pickupTypeFilter = activePickupTypeFilters.length === 0 ||
      (pickup.private && activePickupTypeFilters.includes('private')) ||
      (!pickup.private && activePickupTypeFilters.includes('shared'));

    return searchMatch && pickupTypeFilter;
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error && !useSampleData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('pickup.title')} onBack={handleBack} />
      </View>

      <View style={styles.content}>
        <SearchBar
          placeholder={i18n.t('pickup.searchHotel')}
          onChangeText={handleSearch}
          onFilterPress={handleFilter}
          value={searchQuery}
        />
        
        <HotelPickupListContainer
          pickups={filteredPickups}
          cities={CITIES}
          selectedFromCity={selectedFromCity}
          selectedToCity={selectedToCity}
          onSelectCity={handleSelectCity}
          isLoading={loading}
        />
      </View>

      {/* FilterPopup with pickup type filters */}
      <FilterPopup
        visible={filterPopupVisible}
        onClose={() => setFilterPopupVisible(false)}
        filterOptions={filterOptions}
        onApplyFilters={handleApplyFilters}
        title={i18n.t('pickup.filterPickups')}
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

export default HotelPickupScreen;