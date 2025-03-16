import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentCard from '../components/EntertainmentCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedEntertainment, Entertainment, fetchEntertainments, EntertainmentState } from '../store/entertainmentSlice';

const EntertainmentScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    entertainments,
    loading,
    error
  } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

  // Use sample data while testing

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

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilter = () => {
    // Implement filter functionality
    console.log('Filter pressed');
  };

  const handleSelectEntertainment = (entertainment: Entertainment) => {
    dispatch(setSelectedEntertainment(entertainment));
    // Navigate to detail screen if needed
    // navigation.navigate('EntertainmentDetail', { productCode: entertainment.productCode });
  };

  // Filter entertainments based on search query
  //   const filteredEntertainments = Array.isArray(entertainments) 
  //     ? entertainments.filter(item => 
  //         item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //         item.description.toLowerCase().includes(searchQuery.toLowerCase())
  //       )
  //     : [];

  const filteredEntertainments = entertainments;

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
      <ScreenHeader title="Entertainment" onBack={handleBack} />

      <SearchBar
        placeholder="Search entertainment..."
        onChangeText={handleSearch}
        onFilterPress={handleFilter}
        value={searchQuery}
      />
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
    paddingVertical: 16,
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
});

export default EntertainmentScreen; 