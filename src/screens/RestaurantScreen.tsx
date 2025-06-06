import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import i18n from '../translations/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRestaurants, setSelectedRestaurantType } from '../store/index';

// Import custom components
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import FilterSelector from '../components/FilterSelector';
import SearchBar from '../components/SearchBar';
import RestaurantListContainer from '../containers/RestaurantListContainer';

// Import types
import ButtonFixe from '../components/ButtonFixe';
import ScreenHeader from '../components/ScreenHeader';
import { cities, normalizeString } from '../data/filterData';
import { RootStackParamList } from '../types/navigation';
import { Restaurant, RestaurantType } from '../types/Restaurant';
import Pagination from "../components/Pagination";

const TOUR_FLAG = '@restaurantsTourSeen';

type RestaurantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Restaurant'>;

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const RestaurantScreenContent: React.FC = () => {
  const navigation = useNavigation<RestaurantScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  
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
  const [selectedCity, setSelectedCity] = useState('all');

  // ─── Hooks pagination ─────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  // reset page on search / filters / city change
  useEffect(() => {
    setCurrentPage(1);
  }, [ searchQuery, selectedCity, filterOptions]);
  // ────────────────────────────────────────────────────

  // Add icons to filter categories - only for restaurant type
  const categoriesWithIcons = {
    restaurant_type: {
      key: 'restaurant_type',
      label: i18n.t('restaurants.byType'),
      icon: <Ionicons name="restaurant" size={20} color="#CE1126" />
    }
  };

  // Initialize filter options
  useEffect(() => {
    if (filterOptions.length === 0 && restaurants.length > 0) {
      // Create restaurant type filter options
      const typeOptions = Object.values(RestaurantType).map(type => ({
        id: normalizeString(type),
        label: type,
        selected: false,
        category: 'restaurant_type'
      }));
      
      setFilterOptions(typeOptions);
    }
  }, [restaurants]);

  // Fetch restaurants when component mounts
  useEffect(() => {
    dispatch(fetchRestaurants());
  }, [dispatch]);

  // Create city options for FilterSelector
  const cityOptions = [
    { 
      id: 'all', 
      label: i18n.t('restaurants.allCities'), 
      icon: <Ionicons name="globe-outline" size={18} color="#888" /> 
    },
    ...cities.map(city => ({
      id: normalizeString(city.id),
      label: city.label,
      icon: <Ionicons name="location-outline" size={18} color="#888" />
    }))
  ];

  // ─── 1. Lire si le tour a déjà été vu ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        console.log('Tour seen status:', value);
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. Démarrage automatique une seule fois ──────────
  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      loading,
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !loading && !tourStarted && !visible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, loading, startTour, tourStarted, visible]);

  // ─── 3. Enregistrer la fin ou le skip du tour ────────
  useEffect(() => {
    const handleStop = async () => {
      console.log('Tour stopped, saving status...');
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        console.log('Tour status saved successfully');
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      console.log('Step changed to:', step);
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  // Add reset function for manual testing
  const handleResetTour = async () => {
    try {
      console.log('Manually resetting tour status...');
      await AsyncStorage.removeItem(TOUR_FLAG);
      setHasSeenTour(false);
      setTourStarted(false);
      console.log('Tour status reset successfully');
      // Start the tour immediately after reset
      startTour();
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

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

    // Find selected restaurant type filter if any
    const selectedRestaurantType = selectedOptions.find(
      option => option.category === 'restaurant_type' && option.selected
    );

    // Update the Redux store with the selected type if a type is selected
    if (selectedRestaurantType) {
      // Convert the normalized id back to proper RestaurantType format
      const selectedTypeId = selectedRestaurantType.id;
      const matchingType = Object.values(RestaurantType).find(
        type => normalizeString(type) === selectedTypeId
      );
      
      if (matchingType) {
        dispatch(setSelectedRestaurantType(matchingType as RestaurantType));
      }
    } else {
      // Reset to All if no type is selected
      dispatch(setSelectedRestaurantType('All'));
    }
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
  };

  const handleTypeSelection = (type: RestaurantType | 'All Types') => {
    // Convert 'All Types' to 'All' to match our Redux state type
    const reduxType = type === 'All Types' ? 'All' : type;
    dispatch(setSelectedRestaurantType(reduxType));

    // Update filter options to reflect the selected type
    if (type !== 'All Types') {
      setFilterOptions(prevOptions =>
        prevOptions.map(option => {
          if (option.category === 'restaurant_type') {
            return {
              ...option,
              selected: normalizeString(type) === option.id
            };
          }
          return option;
        })
      );
    } else {
      // Clear type selections in filter
      setFilterOptions(prevOptions =>
        prevOptions.map(option => {
          if (option.category === 'restaurant_type') {
            return { ...option, selected: false };
          }
          return option;
        })
      );
    }
  };

  // Apply search and city filters 
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(restaurant.name).includes(normalizeString(searchQuery)) ||
      normalizeString(restaurant.address).includes(normalizeString(searchQuery));
    
    // City filter
    const cityFilter = selectedCity === 'all' ||
      (restaurant.city && normalizeString(restaurant.city) === selectedCity);
    
    return searchMatch && cityFilter;
  });

  // === PAGINATION : découpage des data pour la page courante ===
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentRestaurants = filteredRestaurants.slice(start, start + itemsPerPage);
  // === FIN PAGINATION ===

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader
            title={i18n.t('restaurants.title')}
            showTour={!visible}
            onTourPress={handleStartTour}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CE1126" />
          <Text style={styles.loadingText}>{i18n.t('restaurants.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader
            title={i18n.t('restaurants.title')}
            showTour={!visible}
            onTourPress={handleStartTour}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <ButtonFixe 
            title={i18n.t('restaurants.tryAgain')}
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
        <ScreenHeader
          title={i18n.t('restaurants.title')}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>
      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchRestaurants')}
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('restaurants.searchPlaceholder')}
              onChangeText={handleSearch}
              value={searchQuery}
              onFilterPress={handleFilterPress}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.filterRestaurantsByCity')}
          order={2}
          name="citySelector"
        >
          <WalkthroughableView style={styles.cityHighlight}>
            <View style={styles.cityFilterContainer}>
              <FilterSelector
                options={cityOptions}
                selectedOptionId={selectedCity}
                onSelectOption={handleCitySelect}
                title={i18n.t('restaurants.city')}
              />
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.browseRestaurants')}
          order={3}
          name="restaurantList"
        >
          <WalkthroughableView style={styles.restaurantListHighlight}>
            <RestaurantListContainer
              restaurants={currentRestaurants}
              selectedType={selectedType === 'All' ? 'All Types' : selectedType}
              onSelectType={handleTypeSelection}
              showTypeFilter={false}
            />
          </WalkthroughableView>
        </CopilotStep>

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            totalItems={filteredRestaurants.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title={i18n.t('restaurants.filterTitle')}
          categories={categoriesWithIcons}
        />
      </View>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const RestaurantScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('copilot.navigation.skip'),
        previous: i18n.t('copilot.navigation.previous'),
        next: i18n.t('copilot.navigation.next'),
        finish: i18n.t('copilot.navigation.finish')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
    >
      <RestaurantScreenContent />
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
    backgroundColor: '#008060',
    width: 150,
  },
  searchHighlight: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  cityHighlight: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  restaurantListHighlight: {
    flex: 1,
    width: '100%',
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

export default RestaurantScreen;