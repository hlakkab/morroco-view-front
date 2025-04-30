import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MatchCard from '../components/cards/MatchCard';
import FilterPopup, { FilterCategory, FilterOption } from "../components/FilterPopup";
import FilterSelector from '../components/FilterSelector';
import MatchPopup from '../components/MatchPopup';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../contexts/LanguageContext';
import {
  cities,
  createFilterOptions,
  matchCities,
  matchFilterCategories,
  normalizeString
} from '../data/filterData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatches, setCurrentMatch, setSelectedMatch, toggleMatchBookmark } from '../store/matchSlice';
import i18n from '../translations/i18n';
import { Match } from '../types/match';

const ExploreMatchesScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('all');
  const { currentLanguage } = useLanguage();

  // Add icons to filter categories
  const categoriesWithIcons = {
    stadium: {
      ...matchFilterCategories.stadium,
      icon: <Ionicons name="football" size={20} color="#CE1126" />
    }
  };

  // Create city options for the FilterSelector component
  const cityOptions = [
    { id: 'all', label: i18n.t('matches.allCities'), icon: <Ionicons name="globe-outline" size={16} color="#888" style={{ marginRight: 4 }} /> },
    ...matchCities.map(city => ({
      id: normalizeString(city.id),
      label: city.label,
      icon: <Ionicons name="location" size={16} color="#888" style={{ marginRight: 4 }} />
    }))
  ];

  const dispatch = useAppDispatch();
  const { matches, selectedMatch, loading, error } = 
    useAppSelector(state => state.match);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchMatches()).unwrap();
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        setUseSampleData(true);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Initialize filter options - only for stadiums
  useEffect(() => {
    if (filterOptions.length === 0) {
      const allOptions = createFilterOptions();
      // Only keep stadium filters
      const stadiumOptions = allOptions.filter(option => option.category === 'stadium');
      setFilterOptions(stadiumOptions);
    }
  }, []);

  const handleCardPress = (match: Match) => {
    dispatch(setSelectedMatch(match));
    dispatch(setCurrentMatch(match));
    setModalVisible(true);
  };

  const handleSavePress = (match: Match) => {
    dispatch(toggleMatchBookmark(match));
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      dispatch(setSelectedMatch(null));
      dispatch(setCurrentMatch(null));
    }, 300);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    setFilterPopupVisible(true);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
  };

  const handleCitySelect = (cityId: string) => {
    setSelectedCityId(cityId);
  };

  // Get active stadium filters
  const activeStadiumFilters = filterOptions
    .filter(option => option.category === 'stadium' && option.selected)
    .map(option => option.id);

  // Filter matches based on search, city selection and stadium filters
  const filteredMatches = matches.filter(match => {
    const searchMatch =
      normalizeString(match.homeTeam).includes(normalizeString(searchQuery)) ||
      normalizeString(match.awayTeam).includes(normalizeString(searchQuery));

    // Filter by selected city (if not 'all')
    const cityFilter = selectedCityId === 'all' || 
      normalizeString(match.spot.city || '') === selectedCityId;

    // Filter by stadium if stadium filters are active
    const stadiumFilter = activeStadiumFilters.length === 0 ||
      activeStadiumFilters.includes(normalizeString(match.spot.name));

    return searchMatch && cityFilter && stadiumFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('matches.africaCupOfNations')} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchBarContainer}>
          <SearchBar
            placeholder={i18n.t('matches.searchMatches')}
            onChangeText={handleSearch}
            onFilterPress={handleFilterPress}
            value={searchQuery}
          />
        </View>
        
        <View style={styles.cityFilterContainer}>
          <FilterSelector
            options={cityOptions}
            selectedOptionId={selectedCityId}
            onSelectOption={handleCitySelect}
            title={i18n.t('matches.city')}
          />
        </View>

        {filteredMatches.length > 0 ? (
          <FlatList
            data={filteredMatches}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MatchCard
                match={item}
                handleCardPress={() => handleCardPress(item)}
                handleSaveMatch={() => handleSavePress(item)}
              />
            )}
            contentContainerStyle={styles.matchesList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noMatchesContainer}>
            <Text style={styles.noMatchesText}>{i18n.t('matches.noMatchesFound')}</Text>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <MatchPopup onClose={closeModal} />
        </View>
      </Modal>

      <FilterPopup
        visible={filterPopupVisible}
        onClose={() => setFilterPopupVisible(false)}
        filterOptions={filterOptions}
        onApplyFilters={handleApplyFilters}
        title={i18n.t('matches.filterMatches')}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchBarContainer: {
  },
  cityFilterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  matchesList: {
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 150,
  },
  noMatchesText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ExploreMatchesScreen;