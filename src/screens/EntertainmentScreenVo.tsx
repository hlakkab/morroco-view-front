import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import FilterSelector from '../components/FilterSelector';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';
import { cities, normalizeString } from '../data/filterData';
import { EntertainmentState, fetchEntertainments } from '../store/entertainmentSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import i18n from '../translations/i18n';
import { Entertainment } from '../types/Entertainment';
import { RootStackParamList } from '../types/navigation';

type EntertainmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entertainment'>;

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const EntertainmentScreenContent: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('all');

  const { entertainments, loading, error } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

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
  };

  useEffect(() => {
    // Initial data fetch
    dispatch(fetchEntertainments('5408')); // Default to Marrakech for initial load
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

  // Filter entertainments based on search, city, and location
  const filteredEntertainments = entertainments.filter((ent: Entertainment) => {
    // Search match
    const searchMatch = searchQuery.trim() === '' || 
      normalizeString(ent.title).includes(normalizeString(searchQuery));
    
    // City filter
    const cityMatch = selectedCityId === 'all' || 
      normalizeString(ent.city || '').includes(selectedCityId);
    
    // Location filter - if no location is selected, show all
    const locationMatch = activeLocationFilters.length === 0 || 
      (ent.location && activeLocationFilters.includes(normalizeString(ent.location)));
    
    return searchMatch && cityMatch && locationMatch;
  });

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader title={i18n.t('entertainment.title')} />
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
          <ScreenHeader title={i18n.t('entertainment.title')} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
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
        <ScreenHeader title={i18n.t('entertainment.title')} />
      </View>
      <View style={styles.content}>
        <CopilotStep
          text="Search for entertainment venues and filter by type"
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
          text="Select a city to filter entertainment venues"
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
          text="Browse and select entertainment venues to view their details"
          order={3}
          name="entertainmentList"
        >
          <WalkthroughableView style={styles.entertainmentListHighlight}>
            <EntertainmentListContainerVo entertainments={filteredEntertainments} />
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
        skip: "Skip",
        previous: "Previous",
        next: "Next",
        finish: "Done"
      }}
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
  entertainmentListHighlight: {
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

export default EntertainmentScreenVo;
