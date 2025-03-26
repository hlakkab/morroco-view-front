import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MatchCard from '../components/cards/MatchCard';
import FilterPopup, { FilterCategory, FilterOption } from "../components/FilterPopup";
import MatchPopup from '../components/MatchPopup';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import {
  createFilterOptions,
  matchFilterCategories,
  normalizeString
} from '../data/filterData';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatches, setCurrentMatch, setSelectedMatch, toggleMatchBookmark } from '../store/matchSlice';
import { Match } from '../types/match';

const ExploreMatchesScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  // Add icons to filter categories
  const categoriesWithIcons = {
    ...matchFilterCategories,
    city: {
      ...matchFilterCategories.city,
      icon: <Ionicons name="location" size={20} color="#CE1126" />
    },
    stadium: {
      ...matchFilterCategories.stadium,
      icon: <Ionicons name="football" size={20} color="#CE1126" />
    }
  };

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

  // Initialize filter options
  useEffect(() => {
    if (filterOptions.length === 0) {
      setFilterOptions(createFilterOptions());
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

  // Get active filters
  const activeCityFilters = filterOptions
    .filter(option => option.category === 'city' && option.selected)
    .map(option => option.id);

  const activeStadiumFilters = filterOptions
    .filter(option => option.category === 'stadium' && option.selected)
    .map(option => option.id);

  // Filter matches based on search and filters
  const filteredMatches = matches.filter(match => {
    const searchMatch =
      normalizeString(match.homeTeam).includes(normalizeString(searchQuery)) ||
      normalizeString(match.awayTeam).includes(normalizeString(searchQuery));

    // Filter by city if city filters are active
    const cityFilter = activeCityFilters.length === 0 ||
      activeCityFilters.includes(normalizeString(match.spot.city || ''));

    // Filter by stadium if stadium filters are active
    const stadiumFilter = activeStadiumFilters.length === 0 ||
      activeStadiumFilters.includes(normalizeString(match.spot.name));

    return searchMatch && cityFilter && stadiumFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Africa Cup of Nations" />
      </View>

      <View style={styles.searchBarContainer}>
        <SearchBar
          placeholder="Search matches..."
          onChangeText={handleSearch}
          onFilterPress={handleFilterPress}
          value={searchQuery}
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
          <Text style={styles.noMatchesText}>No matches found for the selected filters.</Text>
        </View>
      )}

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
        title="Filter Matches"
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
    paddingTop: 16,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
  },
  matchesList: {
    paddingHorizontal: 16,
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