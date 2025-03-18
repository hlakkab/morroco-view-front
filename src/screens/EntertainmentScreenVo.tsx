import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';

import { RootStackParamList } from '../types/navigation';
import { Entertainment } from '../types/Entertainment';

// Exemple de données d'entertainment
const SAMPLE_ENTERTAINMENTS: Entertainment[] = [
  {
    id: '1',
    rating: 4.5,
    ratingCount: 574,
    fullStars: 4,
    hasHalfStar: true,
    image: 'https://www.marrakech-montgolfiere.com/images/montgolfiere/hotair.jpg',
    title: "Hot air balloon flight: Marrakech desert and atlas views",
    location: "Marrakech, Morocco",
    price: "137.56",
  },
  // Ajoutez d'autres activités si nécessaire...
];

type EntertainmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entertainment'>;

const EntertainmentScreenVo: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredEntertainments = SAMPLE_ENTERTAINMENTS.filter(ent =>
    ent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ent.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerFixed}>
        <ScreenHeader title="Entertainment" />
        <View style={styles.searchBarContainer}>
          <SearchBar
            placeholder="Search entertainments..."
            onChangeText={handleSearch}
            value={searchQuery}
            onFilterPress={() => {}}
          />
        </View>
      </View>
      <View style={styles.listContainer}>
        <EntertainmentListContainerVo entertainments={filteredEntertainments} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    zIndex: 10,
  },
  searchBarContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  listContainer: {
    flex: 1,
    paddingTop: 220,
  },
});

export default EntertainmentScreenVo;
