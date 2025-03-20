import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';

import { EntertainmentState, fetchEntertainments } from '../store/entertainmentSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Entertainment } from '../types/Entertainment';
import { RootStackParamList } from '../types/navigation';

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

  // Filter entertainments based on search query
  const filteredEntertainments = entertainments.filter((ent: Entertainment) =>
    ent.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Entertainment" />
      </View>
      <View style={styles.content}>
        <SearchBar
          placeholder="Search entertainments..."
          onChangeText={handleSearch}
          value={searchQuery}
          onFilterPress={() => {}}
        />
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default EntertainmentScreenVo;
