import React, { useEffect, useState } from 'react';
import { FlatList, Modal, SafeAreaView, StyleSheet, View } from 'react-native';
import MatchCard from '../components/cards/MatchCard';
import MatchPopup from '../components/MatchPopup';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import HeaderContainer from '../containers/HeaderContainer';
import SearchFilterContainer from '../containers/SearchFilterContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMatches, setSelectedMatch, toggleMatchBookmark } from '../store/matchSlice';
import { Match, Team } from '../types/match';

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

  // Get matches from state or use sample data if API failed
  const displayMatches = matches;

  // Filter matches based on search query
  const filteredMatches = displayMatches.filter(match => 
    match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.spot.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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