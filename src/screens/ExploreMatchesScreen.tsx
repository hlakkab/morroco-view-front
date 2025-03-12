import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Modal } from 'react-native';
import SearchFilterContainer from '../containers/SearchFilterContainer';
import HeaderContainer from '../containers/HeaderContainer';
import MatchCard from '../components/MatchCard';
import MatchPopup from '../components/MatchPopup';
import { Match, Team } from '../types/match';

// Définir les équipes
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

// Données des matchs avec la nouvelle structure
const matches: Match[] = [
  {
    id: '1',
    status: "En cours",
    team1Image: teams.morocco.flag,
    team2Image: teams.comoros.flag,
    homeTeam: teams.morocco,
    awayTeam: teams.comoros,
    teams: "Morocco Vs Comores",
    date: "Mon Oct 03 at 9:00 PM",
    location: {
      address: "Agadir",
      mapUrl: "https://maps.app.goo.gl/e5KkDdBQdYcb7sCH8"
    },
    stadium: "Stade Adrar",
    about: "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997...",
  },
  {
    id: '2',
    status: "Entertainment",
    team1Image: teams.morocco.flag,
    team2Image: teams.senegal.flag,
    homeTeam: teams.morocco,
    awayTeam: teams.senegal,
    teams: "Morocco Vs Senegal",
    date: "Sun Oct 10 at 11:00 PM",
    location: {
      address: "Marrakech",
      mapUrl: "https://maps.app.goo.gl/e5KkDdBQdYcb7sCH8"
    },
    stadium: "Stade Aderdooor",
  },
];

const ExploreMatchesScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [savedMatches, setSavedMatches] = useState<Record<string, boolean>>({});

  const handleCardPress = (match: Match) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  const handleSavePress = (matchId: string) => {
    setSavedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const closeModal = () => {
    setModalVisible(false);
    // Attendre un peu pour une meilleure animation
    setTimeout(() => {
      setSelectedMatch(null);
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header fixe */}
        <View style={styles.headerFixed}>
          <HeaderContainer />
          <SearchFilterContainer />
        </View>

        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchCard
              match={{ ...item, isSaved: savedMatches[item.id] || false }}
              onPress={() => handleCardPress(item)}
              onSavePress={() => handleSavePress(item.id)}
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
              match={selectedMatch || undefined}
              onClose={closeModal}
            />
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerFixed: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    backgroundColor: '#FFF7F7',
    zIndex: 10, // Assure que l'en-tête reste au-dessus
   // elevation: 3, // Pour Android
    shadowColor: '#000', // Pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 220,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExploreMatchesScreen;