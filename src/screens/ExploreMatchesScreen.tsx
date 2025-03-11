import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, Modal } from 'react-native';
import SearchFilterContainer from '../containers/SearchFilterContainer';
import HeaderContainer from '../containers/HeaderContainer';
import MatchCard from '../components/MatchCard';
import MatchPopup, { MatchPopupProps } from '../components/MatchPopup';

// Définir le type Match pour les données
type Match = NonNullable<MatchPopupProps['match']>;

const matches: Match[] = [
  {
    id: '1',
    status: "En cours",
    team1Image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Flag_of_Morocco_hexagram.svg",
    team2Image: "https://cdn.britannica.com/27/4227-050-00DBD10A/Flag-South-Africa.jpg",
    teams: "Morocco Vs Senegal", 
    date: "Mon Oct 03 at 9:00 PM" 
  },
  { 
    id: '2',
    status: "En cours",
    team1Image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Flag_of_Morocco_hexagram.svg",
    team2Image: "https://cdn.britannica.com/27/4227-050-00DBD10A/Flag-South-Africa.jpg",
    teams: "Morocco Vs Comores", 
    date: "Mon Oct 03 at 9:00 PM" 
  },
  { 
    id: '3',
    status: "En cours",
    team1Image: "https://upload.wikimedia.org/wikipedia/commons/6/67/Flag_of_Morocco_hexagram.svg",
    team2Image: "https://cdn.britannica.com/27/4227-050-00DBD10A/Flag-South-Africa.jpg",
    teams: "Morocco Vs Congo", 
    date: "Mon Oct 03 at 9:00 PM" 
  },
  
];

const ExploreMatchesScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleCardPress = (match: Match) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMatch(null); // Réinitialiser selectedMatch lors de la fermeture
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <HeaderContainer />
        <SearchFilterContainer />
        
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MatchCard 
              match={item} 
              onPress={() => handleCardPress(item)} 
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
  matchesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExploreMatchesScreen;
