import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Modal } from 'react-native';
import SearchFilterContainer from '../containers/SearchFilterContainer';
import HeaderContainer from '../containers/HeaderContainer';
import MatchCard from '../components/cards/MatchCard';
import MatchPopup from '../components/MatchPopup';
import { Match, Team } from '../types/match';
import SearchBar from '../components/SearchBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatches, setSelectedMatch, toggleMatchBookmark } from '../store/matchSlice';
import ScreenHeader from '../components/ScreenHeader';
import FilterPopup, {FilterOption} from "../components/FilterPopup";

// Sample teams data for fallback
const teams: Record<string, Team> = {
  morocco: {
    id: 'mor',
    name: 'Morocco',
    flag: 'https://www.countryflags.com/wp-content/uploads/morocco-flag-png-large.png'
  },
  comoros: {
    id: 'com',
    name: 'Comoros',
    flag: 'https://www.countryflags.com/wp-content/uploads/comoros-flag-png-large.png'
  },
  senegal: {
    id: 'sen',
    name: 'Senegal',
    flag: 'https://www.countryflags.com/wp-content/uploads/senegal-flag-png-large.png'
  }
};



const ExploreMatchesScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);


  const dispatch = useAppDispatch();
  const { matches, selectedMatch, loading, error } = 
    useAppSelector(state => state.match);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchMatches()).unwrap();
      } catch (error) {
        console.error('Failed to fetch matches:', error);
        setUseSampleData(true); // Fallback to sample data if API fails
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Initialise les options de filtre dès que les matchs sont chargés
  useEffect(() => {
    if (matches.length > 0 && filterOptions.length === 0) {
      const uniqueTeams = Array.from(new Set(matches.map(match => match.homeTeam)));
      const options = uniqueTeams.map(team => ({
        id: team,
        label: team,
        selected: false,
        category: 'team'
      }));
      setFilterOptions(options);
    }
  }, [matches]);


  const handleCardPress = (match: Match) => {
    dispatch(setSelectedMatch(match));
    setModalVisible(true);
  };

  const handleSavePress = (match: Match) => {
    dispatch(toggleMatchBookmark(match));
  };

  const closeModal = () => {
    setModalVisible(false);
    // Wait a bit for better animation
    setTimeout(() => {
      dispatch(setSelectedMatch(null));
    }, 300);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
  };

  // Get matches from state or use sample data if API failed
  const displayMatches = matches;



  // Récupérer les filtres actifs (par exemple, pour l'équipe à domicile)
  const activeTeamFilters = filterOptions
      .filter(option => option.category === 'team' && option.selected)
      .map(option => option.id);


  // Filtrer les matchs en fonction de la recherche et du filtre appliqué
  const filteredMatches = matches.filter(match => {
    const searchMatch =
        match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.spot.address.toLowerCase().includes(searchQuery.toLowerCase());

    const teamMatch =
        activeTeamFilters.length === 0 || activeTeamFilters.includes(match.homeTeam);

    return searchMatch && teamMatch;
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

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <MatchPopup
              match={selectedMatch!}
              onClose={closeModal}
            />
          </View>
        </Modal>
      {/* Intégration du FilterPopup */}
      <FilterPopup
          visible={filterPopupVisible}
          onClose={() => setFilterPopupVisible(false)}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filtrer les matchs"
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
});

export default ExploreMatchesScreen;