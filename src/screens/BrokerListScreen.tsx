import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import FilterPopup, { FilterOption } from "../components/FilterPopup";
import FilterSelector from '../components/FilterSelector';
import Pagination from "../components/Pagination";
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import BrokerListContainer from '../containers/BrokerListContainer';
import {
  cities,
  createBrokerFilterOptions,
  getBrokerFilterCategories,
  normalizeString
} from '../data/filterData';
import { fetchBrokers } from '../store/exchangeBrokerSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import i18n from '../translations/i18n';
import { Broker } from '../types/exchange-broker';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const BrokerListScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [allBrokers, setAllBrokers] = useState<Broker[]>([]);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

  // === PAGINATION ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  // Réinitialiser la page quand recherche, ville ou filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, filterOptions]);
  // === FIN PAGINATION ===

  // Add icons to filter categories - only include broker_type
  const categoriesWithIcons = {
    broker_type: {
      ...getBrokerFilterCategories().broker_type,
      icon: <Ionicons name="business" size={20} color="#CE1126" />
    }
  };

  // Get data from Redux store
  const {
    brokers,
    loading,
    error
  } = useAppSelector(state => state.exchangeBroker);

  // Store all brokers in local state when they're loaded
  useEffect(() => {
    if (brokers.length > 0) {
      setAllBrokers(brokers);
    }
  }, [brokers]);

  // Initialize filter options - only for broker_type
  useEffect(() => {
    if (filterOptions.length === 0) {
      const allOptions = createBrokerFilterOptions();
      // Only keep service type filters
      const typeOptions = allOptions.filter(option => option.category === 'broker_type');
      setFilterOptions(typeOptions);
    }
  }, []);

  // Fetch brokers on component mount with default city
  useEffect(() => {
    // Fetch brokers with default city (Marrakech) to prevent API error
    dispatch(fetchBrokers('Marrakech')).unwrap()
      .catch(error => console.error("Error fetching brokers:", error));
  }, [dispatch]);

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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

  // Create city options for the FilterSelector using cities from filterData
  const cityOptions = [
    { 
      id: 'all', 
      label: i18n.t('matches.allCities'), 
      icon: <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 4 }} /> 
    },
    ...cities.map(city => ({
      id: normalizeString(city.id),
      label: city.label,
      icon: <Ionicons name="location-outline" size={16} color="#888" style={{ marginRight: 4 }} />
    }))
  ];

  // Get active type filters
  const activeTypeFilters = filterOptions
    .filter(option => option.category === 'broker_type' && option.selected)
    .map(option => option.id);

  // Helper function to check if a broker matches a city filter
  const brokerMatchesCity = (broker: Broker, cityId: string): boolean => {
    if (cityId === 'all') return true;
    
    // Try different matching approaches
    const normalizedBrokerCity = normalizeString(broker.city);
    const normalizedCityId = normalizeString(cityId);
    
    // Check exact match
    if (normalizedBrokerCity === normalizedCityId) return true;
    
    // Check if broker city contains the city id
    if (normalizedBrokerCity.includes(normalizedCityId)) return true;
    
    // Check if city id contains the broker city
    if (normalizedCityId.includes(normalizedBrokerCity)) return true;
    
    // Look up city label and check if it matches
    const cityObject = cities.find(c => normalizeString(c.id) === normalizedCityId);
    if (cityObject && normalizedBrokerCity.includes(normalizeString(cityObject.label))) {
      return true;
    }
    
    return false;
  };

  // Filter brokers based on search query, city selection and type filters
  const filteredBrokers = brokers.filter(broker => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(broker.name).includes(normalizeString(searchQuery)) ||
      normalizeString(broker.address).includes(normalizeString(searchQuery));
    
    // City filter using our helper function
    const cityFilter = brokerMatchesCity(broker, selectedCity);
    
    // Type filter - if no type is selected, show all
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
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCity(cityId);
    
    // If it's not "all", fetch brokers for that city
    if (cityId !== 'all') {
      // Find the matching city object
      const selectedCityObj = cities.find(city => normalizeString(city.id) === cityId);
      if (selectedCityObj) {
        dispatch(fetchBrokers(selectedCityObj.label))
          .catch(error => console.error("Error fetching brokers for city:", error));
      }
    } else if (allBrokers.length > 0) {
      // If "All Cities" is selected and we have cached brokers, use those
      // We don't make an API call without a city parameter
    }
  };

  // === PAGINATION : découpage des data pour la page courante ===
  const totalPages = Math.ceil(filteredBrokers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBrokers = filteredBrokers.slice(startIndex, startIndex + itemsPerPage);
  // === FIN PAGINATION ===

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={i18n.t('exchange.brokerList')} onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>{i18n.t('exchange.loadingBrokers')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={i18n.t('exchange.brokerList')} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{i18n.t('exchange.failedToLoad')}</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
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
        <ScreenHeader title={i18n.t('exchange.brokerList')} onBack={handleBack} />
      </View>

      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchBroker')}
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('exchange.searchBrokers')}
              onChangeText={handleSearch}
              onFilterPress={handleFilterPress}
              value={searchQuery}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.filterBrokerByCity')}
          order={2}
          name="cityFilter"
        >
          <WalkthroughableView style={styles.cityHighlight}>
            <View style={styles.cityFilterContainer}>
              <FilterSelector
                options={cityOptions}
                selectedOptionId={selectedCity}
                onSelectOption={handleCitySelect}
                title={i18n.t('matches.city')}
              />
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <BrokerListContainer brokers={currentBrokers} />

        {/* === Pagination : afficher si plus d'une page === */}
        {totalPages > 0 && (
          <CopilotStep
            text={i18n.t('copilot.navigatePages')}
            order={4}
            name="pagination"
          >
            <WalkthroughableView style={styles.paginationHighlight}>
              <Pagination
                totalItems={filteredBrokers.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </WalkthroughableView>
          </CopilotStep>
        )}
        {/* === Fin Pagination === */}

        <FilterPopup
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title={i18n.t('exchange.filterBrokers')}
          categories={categoriesWithIcons}
        />
      </View>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const BrokerListScreen: React.FC = () => {
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
      <BrokerListScreenContent />
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
  cityFilterContainer: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  // Tour-specific styles
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
  paginationHighlight: {
    width: '100%',
    overflow: 'hidden',
    marginTop: 16,
  }
});

export default BrokerListScreen;