import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import FilterSelector from '../components/FilterSelector';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import BookmarkListContainer from '../containers/BookmarkListContainer';
import BottomNavBar from '../containers/BottomNavBar';
import { cities, normalizeString } from '../data/filterData';
import { fetchBookmarks } from '../store/bookmarkSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';

// Define all possible service types
const ALL_SERVICE_TYPES = [
  { id: 'pickup', type: 'PICKUP', label: 'Transport' },
  { id: 'match', type: 'MATCH', label: 'Match' },
  { id: 'money_exchange', type: 'MONEY_EXCHANGE', label: 'Money Exchange' },
  { id: 'restaurant', type: 'RESTAURANT', label: 'Restaurant' },
  { id: 'monument', type: 'MONUMENT', label: 'Monument' },
  { id: 'entertainment', type: 'ENTERTAINMENT', label: 'Entertainment' }
];

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

// Content component with Copilot functionality
const BookmarkScreenContent: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { bookmarks, loading, error } = useAppSelector((state) => state.bookmark);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [filteredBookmarks, setFilteredBookmarks] = useState(bookmarks);

  // Create city options for FilterSelector
  const cityOptions = [
    { 
      id: 'all', 
      label: i18n.t('bookmark.allCities'), 
      icon: <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 4 }} /> 
    },
    ...cities
      .map(city => ({
        id: normalizeString(city.id),
        label: city.label,
        icon: <Ionicons name="location-outline" size={16} color="#888" style={{ marginRight: 4 }} />
      }))
  ];

  // Add icons to filter categories - only for service type
  const categoriesWithIcons = {
    bookmark_type: {
      key: 'bookmark_type',
      label: i18n.t('bookmark.byServiceType'),
      icon: <Ionicons name="apps" size={20} color="#CE1126" />
    }
  };

  // Initialize filter options - only for service types
  useEffect(() => {
    if (bookmarks.length > 0 || filterOptions.length === 0) {
      // Create service type filter options (always showing all possible service types)
      const typeOptions = ALL_SERVICE_TYPES.map(service => ({
        id: normalizeString(service.type),
        label: service.label,
        selected: false,
        category: 'bookmark_type'
      }));

      setFilterOptions(typeOptions);
    }
  }, [bookmarks]);

  // Apply search and filters to bookmarks
  useEffect(() => {
    filterBookmarks();
  }, [searchQuery, filterOptions, bookmarks, selectedCityId]);

  // Fetch bookmarks when component mounts
  useEffect(() => {
    dispatch(fetchBookmarks());
  }, [dispatch]);

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted) {
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [startTour, tourStarted]);

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

  const handleNavigation = (routeName: string) => {
    // Use a type assertion to tell TypeScript that routeName is a valid key
    // @ts-ignore - We're handling navigation in a generic way
    navigation.navigate(routeName);
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
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
  };

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

  // Filter bookmarks based on search query and selected filters
  const filterBookmarks = () => {
    if (!bookmarks || bookmarks.length === 0) {
      setFilteredBookmarks([]);
      return;
    }

    // Get active filters
    const activeTypeFilters = filterOptions
      .filter(option => option.category === 'bookmark_type' && option.selected)
      .map(option => option.id);
    
    // Apply filters
    const filtered = bookmarks.filter(bookmark => {
      // Search match - check title and description in the bookmark object
      const searchMatch = searchQuery.trim() === '' || 
        (bookmark.object && 
          ((bookmark.object.name && normalizeString(bookmark.object.name).includes(normalizeString(searchQuery))) ||
           (bookmark.object.title && normalizeString(bookmark.object.title).includes(normalizeString(searchQuery))) ||
           (bookmark.object.description && normalizeString(bookmark.object.description).includes(normalizeString(searchQuery))) ||
           (bookmark.object.homeTeam && normalizeString(bookmark.object.homeTeam).includes(normalizeString(searchQuery))) ||
           (bookmark.object.awayTeam && normalizeString(bookmark.object.awayTeam).includes(normalizeString(searchQuery)))
          )
        );
      
      // City filter - if 'all' is selected, show all
      const cityMatch = selectedCityId === 'all' || 
        (bookmark.object && bookmark.object.city && 
          normalizeString(bookmark.object.city) === selectedCityId);
      
      // Type filter - if no type is selected, show all
      const typeMatch = activeTypeFilters.length === 0 || 
        activeTypeFilters.includes(normalizeString(bookmark.type));
      
      return searchMatch && cityMatch && typeMatch;
    });
    
    setFilteredBookmarks(filtered);
  };

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
        <ScreenHeader title={i18n.t('bookmark.title')} onBack={handleBack} />
      </View>
      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchBookmarks')}
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('bookmark.searchPlaceholder')}
              onChangeText={handleSearch}
              value={searchQuery}
              onFilterPress={handleFilterPress}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.filterBookmarksByCity')}
          order={2}
          name="citySelector"
        >
          <WalkthroughableView style={styles.cityHighlight}>
            <View style={styles.cityFilterContainer}>
              <FilterSelector
                options={cityOptions}
                selectedOptionId={selectedCityId}
                onSelectOption={handleCitySelect}
                title={i18n.t('bookmark.city')}
              />
            </View>
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.manageBookmarks')}
          order={3}
          name="bookmarkList"
        >
          <WalkthroughableView style={styles.bookmarkListHighlight}>
            <BookmarkListContainer 
              bookmarks={filteredBookmarks}
              loading={loading}
              error={error}
            />
          </WalkthroughableView>
        </CopilotStep>
      </View>

      <FilterPopup
        visible={filterPopupVisible}
        onClose={handleCloseFilter}
        filterOptions={filterOptions}
        onApplyFilters={handleApplyFilters}
        title={i18n.t('bookmark.filterTitle')}
        categories={categoriesWithIcons}
      />

      <BottomNavBar activeRoute="Bookmark" onNavigate={handleNavigation} />
    </SafeAreaView>
  );
};

// Main component with CopilotProvider
const BookmarkScreen: React.FC = () => {
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
      <BookmarkScreenContent />
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
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingHorizontal: 16,
  },
  cityFilterContainer: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  searchHighlight: {
    marginBottom: 16,
  },
  cityHighlight: {
    marginBottom: 16,
  },
  bookmarkListHighlight: {
    flex: 1,
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

export default BookmarkScreen; 