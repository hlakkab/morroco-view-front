import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTours} from '../store/tourSlice';
import FilterSelector from '../components/FilterSelector';
import TourCard from '../components/cards/TourCard';
import { Tour } from '../types/tour';

const TourListContainer: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const { savedTours, loading, error } = useAppSelector((state) => state.tour);

  useEffect(() => {
    dispatch(fetchTours());
  }, [dispatch]);

  const handleEditTour = (tour: any) => {
    console.log('Edit tour:', tour);
  };

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TourCard
      item={item}
      handleCardPress={() => handleEditTour(item)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#AE1913" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!savedTours || savedTours.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tours available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Tours</Text>
      
      <FlatList
        data={savedTours}
        renderItem={renderTourCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#AE1913',
    fontSize: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#666',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  }
});

export default TourListContainer; 