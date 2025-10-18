import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import FilterPopup, { FilterOption } from "../components/FilterPopup";
import FilterSelector from '../components/FilterSelector';
import Pagination from "../components/Pagination";
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import GuideListContainer from '../containers/GuideListContainer';
import {
    cities,
    createGuideFilterOptions,
    getGuideFilterCategories,
    normalizeString
} from '../data/filterData';
import { fetchGuides } from '../store/guideSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import i18n from '../translations/i18n';
import { Guide } from '../types/guide';

const TOUR_FLAG = '@guideListTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const GuideListScreenContent: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [allGuides, setAllGuides] = useState<Guide[]>([]);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);

  // === PAGINATION ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  // Reset page when search, city or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, filterOptions]);
  // === END PAGINATION ===

  // Add icons to filter categories
  const categoriesWithIcons = {
    guide_specialty: {
      ...getGuideFilterCategories().guide_specialty,
      icon: <Ionicons name="star" size={20} color="#CE1126" />
    },
    guide_language: {
      ...getGuideFilterCategories().guide_language,
      icon: <Ionicons name="language" size={20} color="#CE1126" />
    }
  };

  // Get data from Redux store
  const {
    guides,
    loading,
    error
  } = useAppSelector(state => state.guide);

  // Store all guides in local state when they're loaded
  useEffect(() => {
    if (guides.length > 0) {
      setAllGuides(guides);
    }
  }, [guides]);

  // Initialize filter options
  useEffect(() => {
    if (filterOptions.length === 0) {
      setFilterOptions(createGuideFilterOptions());
    }
  }, []);

  // Fetch guides on component mount with default city
  useEffect(() => {
    // Fetch guides with default city (Marrakech) to prevent API error
    dispatch(fetchGuides('Marrakech')).unwrap()
      .catch(error => console.error("Error fetching guides:", error));
  }, [dispatch]);

  // ─── 1. Read if tour has already been seen ─────────────────
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

  // ─── 2. Automatic start once ──────────
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

  // ─── 3. Save tour completion ────────
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

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
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

  // Get active specialty and language filters
  const activeSpecialtyFilters = filterOptions
    .filter(option => option.category === 'guide_specialty' && option.selected)
    .map(option => option.id);

  const activeLanguageFilters = filterOptions
    .filter(option => option.category === 'guide_language' && option.selected)
    .map(option => option.id);

  // Helper function to check if a guide matches a city filter
  const guideMatchesCity = (guide: Guide, cityId: string): boolean => {
    if (cityId === 'all') return true;
    
    // Try different matching approaches
    const normalizedGuideCity = normalizeString(guide.city);
    const normalizedCityId = normalizeString(cityId);
    
    // Check exact match
    if (normalizedGuideCity === normalizedCityId) return true;
    
    // Check if guide city contains the city id
    if (normalizedGuideCity.includes(normalizedCityId)) return true;
    
    // Check if city id contains the guide city
    if (normalizedCityId.includes(normalizedGuideCity)) return true;
    
    // Look up city label and check if it matches
    const cityObject = cities.find(c => normalizeString(c.id) === normalizedCityId);
    if (cityObject && normalizedGuideCity.includes(normalizeString(cityObject.label))) {
      return true;
    }
    
    return false;
  };

  // Filter guides based on search query, city selection and filters
  const filteredGuides = guides.filter(guide => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(guide.name).includes(normalizeString(searchQuery)) ||
      normalizeString(guide.region).includes(normalizeString(searchQuery)) ||
      normalizeString(guide.bio).includes(normalizeString(searchQuery));
    
    // City filter using our helper function
    const cityFilter = guideMatchesCity(guide, selectedCity);
    
    // Specialty filter - if no specialty is selected, show all
    const specialtyFilter = activeSpecialtyFilters.length === 0 ||
      guide.specialties.some(specialty => 
        activeSpecialtyFilters.includes(normalizeString(specialty))
      );
    
    // Language filter - if no language is selected, show all
    const languageFilter = activeLanguageFilters.length === 0 ||
      guide.languages.some(language => 
        activeLanguageFilters.includes(normalizeString(language))
      );
    
    return searchMatch && cityFilter && specialtyFilter && languageFilter;
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
    
    // If it's not "all", fetch guides for that city
    if (cityId !== 'all') {
      // Find the matching city object
      const selectedCityObj = cities.find(city => normalizeString(city.id) === cityId);
      if (selectedCityObj) {
        dispatch(fetchGuides(selectedCityObj.label))
          .catch(error => console.error("Error fetching guides for city:", error));
      }
    } else if (allGuides.length > 0) {
      // If "All Cities" is selected and we have cached guides, use those
      // We don't make an API call without a city parameter
    }
  };

  // === PAGINATION : slice data for current page ===
  const totalPages = Math.ceil(filteredGuides.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentGuides = filteredGuides.slice(startIndex, startIndex + itemsPerPage);
  // === END PAGINATION ===

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader 
            title={i18n.t('guide.guideList')} 
            onBack={handleBack}
            showTour={!visible}
            onTourPress={handleStartTour}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>{i18n.t('guide.loadingGuides')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title={i18n.t('guide.guideList')} onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{i18n.t('guide.failedToLoad')}</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('guide.guideList')} 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>

      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchGuide')}
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('guide.searchGuides')}
              onChangeText={handleSearch}
              onFilterPress={handleFilterPress}
              value={searchQuery}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.filterGuideByCity')}
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

        <GuideListContainer guides={currentGuides} loading={loading} error={error} />

        {/* === Pagination : show if more than one page === */}
        {totalPages > 0 && (
          <Pagination
            totalItems={filteredGuides.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {/* === End Pagination === */}

        <FilterPopup
          visible={filterVisible}
          onClose={() => setFilterVisible(false)}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title={i18n.t('guide.filterGuides')}
          categories={categoriesWithIcons}
        />
      </View>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const GuideListScreen: React.FC = () => {
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
      <GuideListScreenContent />
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
});

export default GuideListScreen;

