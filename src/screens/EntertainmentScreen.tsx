import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, FlatList } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentCard from '../components/EntertainmentCard';
import FilterSelector from '../components/FilterSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedEntertainment, fetchEntertainments, EntertainmentState } from '../store/entertainmentSlice';
import { Entertainment } from '../types/Entertainment';

const EntertainmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('5408');
  const [visible, setVisible] = useState(true);

  const {
    entertainments,
    loading,
    error
  } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

  // City filter options for Marrakech and Casablanca
  const cityFilterOptions = [
    { id: '5408', label: 'Marrakech' },
    { id: '4396', label: 'Casablanca' },
    { id: '4388', label: 'Tangier'},
  ];

  useEffect(() => {
    // Initial data fetch - default city (Marrakech) will be used
    fetchEntertainmentData();
  }, []);

  const fetchEntertainmentData = async (cityCode?: string) => {
    try {
      await dispatch(fetchEntertainments(cityCode || '5408')).unwrap();
    } catch (error) {
      console.error('Failed to fetch entertainments:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilter = () => {
    // This function is still needed for the SearchBar's filter button
    console.log('Filter button pressed');
  };

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    
    // Fetch entertainments with the selected city code
    // If 'all' is selected, don't filter by city (use default)
    if (cityId === 'all') {
      fetchEntertainmentData();
    } else {
      fetchEntertainmentData(cityId);
    }
  };

  const handleSelectEntertainment = (entertainment: Entertainment) => {
    dispatch(setSelectedEntertainment(entertainment));
    // Navigate to detail screen if needed
    // navigation.navigate('EntertainmentDetail', { productCode: entertainment.productCode });
  };

  const handleStartTour = () => {
    setVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Filter entertainments based on search query
  const filteredEntertainments = Array.isArray(entertainments) 
    ? entertainments.filter(item => 
        searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderEntertainmentItem = ({ item }: { item: Entertainment }) => {
    return (
      <EntertainmentCard 
        item={item} 
        onPress={handleSelectEntertainment} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader 
          title="Entertainment" 
          onBack={handleBack}
          showTour={!visible}
          onTourPress={handleStartTour}
        />
      </View>

      <SearchBar
        placeholder="Search entertainment..."
        onChangeText={handleSearch}
        onFilterPress={handleFilter}
        value={searchQuery}
      />

      <View style={styles.filterContainer}>
        <FilterSelector
          options={cityFilterOptions}
          selectedOptionId={selectedCityId}
          onSelectOption={handleSelectCity}
          title="Filter by City"
        />
      </View>

      <View style={styles.content}>
        <FlatList
          data={filteredEntertainments}
          renderItem={renderEntertainmentItem}
          keyExtractor={(item) => item.productCode}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No entertainment options found</Text>
            </View>
          }
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  listContainer: {
    paddingBottom: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardCode: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    padding: 16,
  },
});

export default EntertainmentScreen; 