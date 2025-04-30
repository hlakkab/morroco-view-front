// src/screens/ExploreMatchesScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import MatchCard from '../components/cards/MatchCard';
import FilterPopup, { FilterOption } from "../components/FilterPopup";
import FilterSelector from '../components/FilterSelector';
import MatchPopup from '../components/MatchPopup';
import Pagination from '../components/Pagination';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../contexts/LanguageContext';
import {
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
  // États et dispatch
  const dispatch = useAppDispatch();
  const { matches } = useAppSelector(state => state.match);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Récupérer les matchs
  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  // Initialiser les filtres (stadium)
  useEffect(() => {
    if (filterOptions.length === 0) {
      const allOptions = createFilterOptions();
      const stadiumOptions = allOptions.filter(opt => opt.category === 'stadium');
      setFilterOptions(stadiumOptions);
    }
  }, [filterOptions]);

  // Reset page quand filtre ou recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCityId, filterOptions]);

  // Préparer les données filtrées
  const activeStadiums = filterOptions.filter(opt => opt.selected).map(opt => opt.id);

  const filteredMatches = matches.filter(match => {
    const matchText = normalizeString(match.homeTeam + match.awayTeam);
    const searchMatch = matchText.includes(normalizeString(searchQuery));
    const cityMatch = selectedCityId === 'all' || normalizeString(match.spot.city || '') === selectedCityId;
    const stadiumMatch = activeStadiums.length === 0 || activeStadiums.includes(normalizeString(match.spot.name));
    return searchMatch && cityMatch && stadiumMatch;
  });

  // Pagination des données
  const start = (currentPage - 1) * itemsPerPage;
  const currentMatches = filteredMatches.slice(start, start + itemsPerPage);

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader title={i18n.t('matches.africaCupOfNations')} />
        </View>
        <View style={styles.content}>
          <SearchBar
              placeholder={i18n.t('matches.searchMatches')}
              onChangeText={setSearchQuery}
              onFilterPress={() => setFilterPopupVisible(true)}
              value={searchQuery}
          />

          <FilterSelector
              options={[
                { id: 'all', label: i18n.t('matches.allCities') },
                ...matchCities.map(c => ({ id: normalizeString(c.id), label: c.label }))
              ]}
              selectedOptionId={selectedCityId}
              onSelectOption={setSelectedCityId}
              title={i18n.t('matches.city')}
          />

          {filteredMatches.length > 0 ? (
              <>
                <FlatList
                    data={currentMatches}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <MatchCard
                            match={item}
                            handleCardPress={() => {
                              dispatch(setSelectedMatch(item));
                              dispatch(setCurrentMatch(item));
                              setModalVisible(true);
                            }}
                            handleSaveMatch={id => {
                              // Find the match by id and pass the full match object
                              const matchToToggle = matches.find(match => match.id === id);
                              if (matchToToggle) {
                                dispatch(toggleMatchBookmark(matchToToggle));
                              }
                            }}
                        />
                    )}
                    contentContainerStyle={styles.matchesList}
                    showsVerticalScrollIndicator={false}
                />
                <Pagination
                    totalItems={filteredMatches.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
              </>
          ) : (
              <View style={styles.noMatchesContainer}>
                <Text style={styles.noMatchesText}>{i18n.t('matches.noMatchesFound')}</Text>
              </View>
          )}

          <Modal
              visible={modalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <MatchPopup onClose={() => setModalVisible(false)} />
            </View>
          </Modal>

          <FilterPopup
              visible={filterPopupVisible}
              onClose={() => setFilterPopupVisible(false)}
              filterOptions={filterOptions}
              onApplyFilters={opts => setFilterOptions(opts)}
              title={i18n.t('matches.filterMatches')}
              categories={{ stadium: { ...matchFilterCategories.stadium, icon: <Ionicons name="football" size={20} color="#CE1126" /> } }}
          />
        </View>
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
    marginBottom: 15,
  },
  noMatchesText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ExploreMatchesScreen;