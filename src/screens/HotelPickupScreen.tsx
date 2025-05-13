import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';

import FilterPopup, { FilterOption } from '../components/FilterPopup';
import Pagination from "../components/Pagination";
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import HotelPickupListContainer from '../containers/HotelPickupListContainer';
import { useLanguage } from '../contexts/LanguageContext';
import {
  createPickupFilterOptions,
  getPickupFilterCategories,
  normalizeString
} from '../data/filterData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHotelPickups, setSearchQuery, setSelectedCity } from '../store/hotelPickupSlice';
import i18n from '../translations/i18n';

const CITIES = ['Marrakech', 'Rabat', 'Agadir', 'Casablanca', 'Fez', 'Tangier'];

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const HotelPickupScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { currentLanguage } = useLanguage();
  const {hotelPickups, selectedCity, searchQuery, loading, error,
    pickupDirection} = useAppSelector((state) => state.hotelPickup);

  const [useSampleData, setUseSampleData] = useState(false);
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

  // Pagination hooks déplacés ici, avant tout return conditionnel
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, filterOptions]);

  // Add icons to filter categories
  const categoriesWithIcons = {
    pickup_type: {
      ...getPickupFilterCategories().pickup_type,
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
        await dispatch(fetchHotelPickups(selectedCity)).unwrap();
      } catch (error) {
        console.error('Failed to fetch hotel pickups:', error);
        setUseSampleData(true);
      }
    };

    fetchData();
  }, [dispatch, selectedCity]);

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted && !loading) {
      // Delay starting the tour until after the UI has rendered
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted, loading]);

  // Handle Copilot events
  useEffect(() => {
    const handleStop = () => {
      console.log('Tour completed or stopped');
    };
    
    copilotEvents.on('stop', handleStop);
    
    return () => {
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleFilter = () => {
    setFilterPopupVisible(true);
  };

  const handleSelectCity = (city: string) => {
    dispatch(setSelectedCity(city));
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
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

  // === PAGINATION : découpage des data pour la page courante ===
  const totalPages = Math.ceil(filteredPickups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPickups = filteredPickups.slice(startIndex, startIndex + itemsPerPage);
  // === FIN PAGINATION ===

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
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>Tour Guide</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('pickup.title')} onBack={handleBack} />
      </View>

      <View style={styles.content}>
        <CopilotStep
          text="Search for a hotel or pickup service"
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('pickup.searchHotel')}
              onChangeText={handleSearch}
              onFilterPress={handleFilter}
              value={searchQuery}
            />
          </WalkthroughableView>
        </CopilotStep>

        <HotelPickupListContainer
          pickups={currentPickups} // ← on injecte ici les données paginées
          cities={CITIES}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          isLoading={loading}
        />

        {/* === Pagination : afficher si plus d'une page === */}
        {totalPages > 0 && (
          <Pagination
            totalItems={filteredPickups.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {/* === Fin Pagination === */}
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

// Main component with CopilotProvider
const HotelPickupScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
    >
      <HotelPickupScreenContent />
    </CopilotProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
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
  searchHighlight: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tooltip: {
    backgroundColor: '#F7F7F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#CE1126',
    width: '85%',
  },
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#008060',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default HotelPickupScreen;