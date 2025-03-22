import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import Redux hooks and actions
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMonuments, setSelectedMonumentType } from '../store/index';

// Import custom components
import SearchBar from '../components/SearchBar';
import MonumentListContainer from '../containers/MonumentListContainer';

// Import types
import { RootStackParamList } from '../types/navigation';
import { MonumentType } from '../types/Monument';
import ScreenHeader from '../components/ScreenHeader';
import ButtonFixe from '../components/ButtonFixe';

type MonumentsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Monuments'>;

const MonumentsScreen: React.FC = () => {
  const navigation = useNavigation<MonumentsScreenNavigationProp>();
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    monuments, 
    loading, 
    error, 
    selectedType 
  } = useAppSelector(state => state.monument);

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch monuments when component mounts
  useEffect(() => {
    dispatch(fetchMonuments());
  }, [dispatch]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleTypeSelection = (type: MonumentType | 'All Types') => {
    // Convert 'All Types' to 'All' to match our Redux state type
    const reduxType = type === 'All Types' ? 'All' : type;
    dispatch(setSelectedMonumentType(reduxType));
  };

  // Apply search filter on top of type filter
  const searchFilteredMonuments = searchQuery.trim() === ''
    ? monuments
    : monuments.filter(monument =>
        monument.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        monument.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Monuments" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008060" />
          <Text style={styles.loadingText}>Loading monuments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Monuments" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <ButtonFixe 
            title="Try Again" 
            onPress={() => dispatch(fetchMonuments())} 
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Monuments" />
      </View>
      <View style={styles.content}>
        <SearchBar
          placeholder="Search monuments..."
          onChangeText={handleSearch}
          value={searchQuery}
          onFilterPress={() => {}}
        />

        <MonumentListContainer
          monuments={monuments}
          selectedType={selectedType === 'All' ? 'All Types' : selectedType}
          onSelectType={handleTypeSelection}
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#008060',
    width: 150,
  },
});

export default MonumentsScreen; 