// src/screens/ExploreMatchesScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
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

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

const ExploreMatchesScreenContent: React.FC = () => {
  // États et dispatch
  const dispatch = useAppDispatch();
  const { matches } = useAppSelector(state => state.match);
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);

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

  // Start the Copilot tour when the component mounts
  useEffect(() => {
    if (!tourStarted) {
      // Delay starting the tour until after the UI has rendered
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

  // Reset page quand filtre ou recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCityId, filterOptions]);

  // Add a button to manually start the tour
  const handleStartTour = () => {
    startTour();
  };

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
      {/* Manual tour button */}
      {!visible && (
        <TouchableOpacity style={styles.tourButton} onPress={handleStartTour}>
          <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.tourButtonText}>{i18n.t('common.tourGuide')}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.headerContainer}>
        <ScreenHeader title={i18n.t('matches.africaCupOfNations')} />
      </View>
      <View style={styles.content}>
        <CopilotStep
          text={i18n.t('copilot.searchMatches')}
          order={1}
          name="search"
        >
          <WalkthroughableView style={styles.searchHighlight}>
            <SearchBar
              placeholder={i18n.t('matches.searchMatches')}
              onChangeText={setSearchQuery}
              onFilterPress={() => setFilterPopupVisible(true)}
              value={searchQuery}
            />
          </WalkthroughableView>
        </CopilotStep>

        <CopilotStep
          text={i18n.t('copilot.filterByMatchCity')}
          order={2}
          name="citySelector"
        >
          <WalkthroughableView style={styles.cityHighlight}>
            <FilterSelector
              options={[
                { id: 'all', label: i18n.t('matches.allCities') },
                ...matchCities.map(c => ({ id: normalizeString(c.id), label: c.label }))
              ]}
              selectedOptionId={selectedCityId}
              onSelectOption={setSelectedCityId}
              title={i18n.t('matches.city')}
            />
          </WalkthroughableView>
        </CopilotStep>

        {filteredMatches.length > 0 ? (
          <>
            <CopilotStep
              text={i18n.t('copilot.browseMatches')}
              order={3}
              name="matchList"
            >
              <WalkthroughableView style={styles.matchesListHighlight}>
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
              </WalkthroughableView>
            </CopilotStep>
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

// Main component with CopilotProvider
const ExploreMatchesScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      animationDuration={300}
      overlay="svg"
      stopOnOutsideClick={true}
      labels={{
        skip: i18n.t('common.skip'),
        previous: i18n.t('common.previous'),
        next: i18n.t('common.next'),
        finish: i18n.t('common.done')
      }}
      arrowSize={8}
      arrowColor="#FFF7F7"
      verticalOffset={0}
    >
      <ExploreMatchesScreenContent />
    </CopilotProvider>
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
  matchesListHighlight: {
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
    backgroundColor: '#FF6B6B',
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

export default ExploreMatchesScreen;