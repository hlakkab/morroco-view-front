import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FilterPopup, { FilterOption } from '../../components/FilterPopup';
import FilterSelector from '../../components/FilterSelector';
import ScreenHeader from '../../components/ScreenHeader';
import SearchBar from '../../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';
import { cities, normalizeString } from '../../data/filterData';
import { EntertainmentState, fetchEntertainments, setFilters, setPage, updateEntertainmentImage } from '../store/entertainmentSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import i18n from '../../translations/i18n';
import { Entertainment, City } from '../types/Entertainment';
import { RootStackParamList } from '../../types/navigation';
import EntertainmentFilters, { EntertainmentFilterValues } from '../components/EntertainmentFilters';
import { useBatchImages } from '../../utils/useImages';

const TOUR_FLAG = '@entertainmentTourSeen';

type EntertainmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entertainment'>;

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const EntertainmentScreenContent: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [entertainmentFilterVisible, setEntertainmentFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [entertainmentFilters, setEntertainmentFilters] = useState<EntertainmentFilterValues>({});

  const { 
    entertainments, 
    loading, 
    error, 
    filters,
    currentPage,
    totalPages,
    totalElements 
  } = useAppSelector((state): EntertainmentState => state.entertainment);

  // Add icons to filter categories - only for location
  const categoriesWithIcons = {
    location: {
      key: 'location',
      label: i18n.t('filters.byType'),
      icon: <Ionicons name="navigate" size={20} color="#CE1126" />
    }
  };

  // Create city options for FilterSelector
  const cityOptions = [
    { 
      id: 'all', 
      label: i18n.t('entertainment.allCities'), 
      icon: <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 4 }} /> 
    },
    ...cities
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
        .filter((ent): ent is Entertainment & { location: string } => 
          ent.location !== undefined && ent.location.trim() !== ''
        )
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

  // ─── 1.  ─────────────────
  useEffect(() => {
    AsyncStorage.getItem(TOUR_FLAG)
      .then(value => {
        
        setHasSeenTour(value === 'true');
      })
      .catch(error => {
        console.error('Error reading tour status:', error);
        setHasSeenTour(false);
      });
  }, []);

  // ─── 2. ──────────
  useEffect(() => {
    

    if (hasSeenTour === false && !loading && !tourStarted && !visible) {
      
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
      
      try {
        await AsyncStorage.setItem(TOUR_FLAG, 'true');
        setHasSeenTour(true);
        setTourStarted(false);
        
      } catch (error) {
        console.error('Error saving tour status:', error);
      }
    };

    const handleStepChange = (step: any) => {
      
    };

    copilotEvents.on('stop', handleStop);
    copilotEvents.on('stepChange', handleStepChange);

    return () => {
      copilotEvents.off('stop', handleStop);
      copilotEvents.off('stepChange', handleStepChange);
    };
  }, [copilotEvents]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
    
    // Update filters with city
    const cityFilter = cityId !== 'all' ? cityId.toUpperCase() as City : undefined;
    const newFilters = { 
      ...filters, 
      city: cityFilter,
      page: 0 // Reset to first page when changing city
    };
    dispatch(setFilters(newFilters));
    dispatch(fetchEntertainments(newFilters));
  };

  const handleEntertainmentFiltersApply = (newFilters: EntertainmentFilterValues) => {
    setEntertainmentFilters(newFilters);
    
    // Merge with existing filters
    const updatedFilters = {
      ...filters,
      ...newFilters,
      page: 0 // Reset to first page when applying filters
    };
    dispatch(setFilters(updatedFilters));
    dispatch(fetchEntertainments(updatedFilters));
  };

  const handlePageChange = (page: number) => {
    // Convert from 1-based to 0-based page number
    const pageIndex = page - 1;
    dispatch(setPage(pageIndex));
    dispatch(fetchEntertainments({ ...filters, page: pageIndex }));
  };

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchEntertainments(filters));
  }, [dispatch]);

  // Background image fetching for entertainments after data is loaded (same pattern as Monument)
  useBatchImages(entertainments, !loading, updateEntertainmentImage);

  const handleFilterPress = () => {
    // Open the new entertainment filters modal
    setEntertainmentFilterVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterPopupVisible(false);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
  };

  const handleCloseEntertainmentFilter = () => {
    setEntertainmentFilterVisible(false);
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  // Filter entertainments based on search only (other filters are handled by API)
  const filteredEntertainments = entertainments.filter((ent: Entertainment) => {
    // Search match - search by name or title
    const displayName = ent.name || ent.title || '';
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(displayName).includes(normalizeString(searchQuery));
    
    return searchMatch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader 
            title={i18n.t('entertainment.title')}
            showTour={!visible}
            onTourPress={handleStartTour}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CE1126" />
          <Text style={styles.loadingText}>{i18n.t('entertainment.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader 
            title={i18n.t('entertainment.title')}
            showTour={!visible}
            onTourPress={handleStartTour}
          />
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
        <ScreenHeader 
          title={i18n.t('entertainment.title')}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>
      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchEntertainment')}
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('entertainment.searchPlaceholder')}
              onChangeText={handleSearch}
              value={searchQuery}
              onFilterPress={handleFilterPress}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.filterEntertainmentByCity')}
          order={2}
          name="citySelector"
        >
          <WalkthroughableView style={styles.cityHighlight}>
            <View style={styles.cityFilterContainer}>
              <FilterSelector
                options={cityOptions}
                selectedOptionId={selectedCityId}
                onSelectOption={handleCitySelect}
                title={i18n.t('entertainment.city')}
              />
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.browseEntertainment')}
          order={3}
          name="entertainmentList"
        >
          <WalkthroughableView style={styles.entertainmentListHighlight}>
            <EntertainmentListContainerVo 
              entertainments={filteredEntertainments}
              loading={loading}
              error={error}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={handlePageChange}
            />
          </WalkthroughableView>
        </CopilotStep>

        <FilterPopup
          visible={filterPopupVisible}
          onClose={handleCloseFilter}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title={i18n.t('entertainment.filterTitle')}
          categories={categoriesWithIcons}
        />

        <EntertainmentFilters
          visible={entertainmentFilterVisible}
          onClose={handleCloseEntertainmentFilter}
          onApply={handleEntertainmentFiltersApply}
          initialFilters={entertainmentFilters}
        />
      </View>
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const EntertainmentScreenVo: React.FC = () => {
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
      <EntertainmentScreenContent />
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
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
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
  entertainmentListHighlight: {
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
  }
});

export default EntertainmentScreenVo;
