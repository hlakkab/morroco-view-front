import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
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
    cities,
    createArtisanFilterOptions,
    getArtisanFilterCategories,
    normalizeString
} from '../data/filterData';
import { Artisan, ArtisanType } from '../types/Artisan';
import { RootStackParamList } from '../types/navigation';
import Pagination from "../components/Pagination";

type ArtisansScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Artisans'>;

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const ArtisansScreenContent: React.FC = () => {
  const navigation = useNavigation<ArtisansScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  
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

  // ─── Hooks pagination ─────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  // reset page on search / filters / city change
  useEffect(() => {
    setCurrentPage(1);
  }, [ searchQuery, selectedCity, filterOptions]);
  // ────────────────────────────────────────────────────

  // Add icons to filter categories - only include artisan_type for FilterPopup
  const categoriesWithIcons = {
    artisan_type: {
      ...getArtisanFilterCategories().artisan_type,
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


  // === PAGINATION : découpage des data pour la page courante ===
  const totalPages = Math.ceil(filteredArtisans.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentArtisans = filteredArtisans.slice(start, start + itemsPerPage);
  // === FIN PAGINATION ===

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted && !loading) {
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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

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
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>Tour Guide</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('artisans.title')} />
      </View>
      <View style={styles.content}>
        <CopilotStep
          text="Search for artisans and filter by type"
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('artisans.searchPlaceholder')}
              onChangeText={handleSearch}
              value={searchQuery}
              onFilterPress={handleFilterPress}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text="Select a city to filter artisans"
          order={2}
          name="citySelector"
        >
          <WalkthroughableView style={styles.cityHighlight}>
            <View style={styles.cityFilterContainer}>
              <FilterSelector
                options={cityOptions}
                selectedOptionId={selectedCity}
                onSelectOption={handleCitySelect}
                title={i18n.t('artisans.city')}
              />
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text="Browse and select artisans to view their details"
          order={3}
          name="artisanList"
        >
          <WalkthroughableView style={styles.artisanListHighlight}>
            <ArtisanListContainer
              artisans={currentArtisans}
              selectedType={selectedType === 'All' ? 'All Types' : selectedType}
              onSelectType={handleTypeSelection}
              showTypeFilter={false}
            />
          </WalkthroughableView>
        </CopilotStep>

        {/* === Pagination : afficher si plus d'une page === */}
        {totalPages > 0 && (
            <Pagination
                totalItems={filteredArtisans.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />
        )}
        {/* === Fin Pagination === */}

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

// Main component with CopilotProvider
const ArtisansScreen: React.FC = () => {
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
      <ArtisansScreenContent />
    </CopilotProvider>
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
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
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
  tooltip: {
    backgroundColor: '#CE1126',
    borderRadius: 10,
  },
  searchHighlight: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cityHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  artisanListHighlight: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  tourButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
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

export default ArtisansScreen; 