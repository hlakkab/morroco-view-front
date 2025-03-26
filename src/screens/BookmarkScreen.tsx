import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, View } from 'react-native';
import FilterPopup, { FilterOption } from '../components/FilterPopup';
import FilterSelector from '../components/FilterSelector';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import BookmarkListContainer from '../containers/BookmarkListContainer';
import BottomNavBar from '../containers/BottomNavBar';
import { cities, normalizeString } from '../data/filterData';
import { fetchBookmarks } from '../store/bookmarkSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
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

const BookmarkScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { bookmarks, loading, error } = useAppSelector((state) => state.bookmark);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('all');
  const [filteredBookmarks, setFilteredBookmarks] = useState(bookmarks);

  // Create city options for FilterSelector
  const cityOptions = [
    { 
      id: 'all', 
      label: 'All Cities', 
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
      label: 'By Service Type',
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
      <View style={styles.headerContainer}>
        <ScreenHeader title="Bookmarks" onBack={handleBack} />
      </View>
      <View style={styles.content}>
        <SearchBar
          placeholder="Search bookmarks..."
          onChangeText={handleSearch}
          value={searchQuery}
          onFilterPress={handleFilterPress}
        />
        <View style={styles.cityFilterContainer}>
          <FilterSelector
            options={cityOptions}
            selectedOptionId={selectedCityId}
            onSelectOption={handleCitySelect}
            title="City :"
          />
        </View>
        <BookmarkListContainer 
          bookmarks={filteredBookmarks}
          loading={loading}
          error={error}
        />
      </View>

      <FilterPopup
        visible={filterPopupVisible}
        onClose={handleCloseFilter}
        filterOptions={filterOptions}
        onApplyFilters={handleApplyFilters}
        title="Filter Bookmarks"
        categories={categoriesWithIcons}
      />

      <BottomNavBar activeRoute="Bookmark" onNavigate={handleNavigation} />
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
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  cityFilterContainer: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
});

export default BookmarkScreen; 