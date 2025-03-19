import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';

import { RootStackParamList } from '../types/navigation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchEntertainments, EntertainmentState } from '../store/entertainmentSlice';
import { Entertainment } from '../types/Entertainment';

type EntertainmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entertainment'>;

const EntertainmentScreenVo: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const { entertainments, loading, error } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchEntertainments()).unwrap();
      } catch (error) {
        console.error('Failed to fetch entertainments:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  // Filtrage des entertainments selon la recherche
  const filteredEntertainments = entertainments.filter((ent: Entertainment) =>
    ent.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default EntertainmentScreenVo;
