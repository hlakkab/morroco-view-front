// src/screens/ExploreMatchesScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { CopilotProvider, CopilotStep, useCopilot, walkthroughable } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MatchCard from '../components/cards/MatchCard';
import FilterPopup, { FilterOption } from "../components/FilterPopup";
import FilterSelector from '../components/FilterSelector';
import MatchPopup from '../components/MatchPopup';
import Pagination from '../components/Pagination';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
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

const TOUR_FLAG = '@exploreMatchTourSeen';

// Create walkthroughable components
const WalkthroughableView = walkthroughable(View);

const ExploreMatchesScreenContent: React.FC = () => {
  // États et dispatch
  const dispatch = useAppDispatch();
  const { matches, loading } = useAppSelector(state => state.match);
  const { isAuthenticated } = useAuth();
  const { start: startTour, copilotEvents, visible } = useCopilot();
  const [tourStarted, setTourStarted] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState<boolean | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  useEffect(() => {
    console.log('Tour conditions:', {
      hasSeenTour,
      tourStarted,
      visible
    });

    if (hasSeenTour === false && !tourStarted && !visible) {
      console.log('Starting tour automatically...');
      const timer = setTimeout(() => {
        startTour();
        setTourStarted(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTour, startTour, tourStarted, visible]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCityId, filterOptions]);

  // Add a button to manually start the tour
  const handleStartTour = () => {
    setTourStarted(true);
    startTour();
  };

  const activeStadiums = filterOptions.filter(opt => opt.selected).map(opt => opt.id);

  const filteredMatches = matches.filter(match => {
    const matchText = normalizeString(match.homeTeam + match.awayTeam);
    const searchMatch = matchText.includes(normalizeString(searchQuery));
    const cityMatch = selectedCityId === 'all' || normalizeString(match.spot.city || '') === selectedCityId;
    const stadiumMatch = activeStadiums.length === 0 || activeStadiums.includes(normalizeString(match.spot.name));
    return searchMatch && cityMatch && stadiumMatch;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const currentMatches = filteredMatches.slice(start, start + itemsPerPage);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title={i18n.t('matches.africaCupOfNations')} 
          showTour={!visible}
          onTourPress={handleStartTour}
        />
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#CE1126" />
            <Text style={styles.loadingText}>{i18n.t('common.loading')}</Text>
          </View>
        ) : filteredMatches.length > 0 ? (
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
                        if (!isAuthenticated()) {
                          setShowAuthModal(true);
                          return;
                        }
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

      {/* Auth Modal for login prompt */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="auth"
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default ExploreMatchesScreen;