import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import TourDetailsModal from '../components/TourDetailsModal';
import TourCard from '../components/cards/TourCard';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTourDetails, fetchTours } from '../store/tourSlice';
import i18n from '../translations/i18n';
import { Tour } from '../types/tour';

const TourListContainer: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const { savedTours, loading, error, currentTour } = useAppSelector((state) => state.tour);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchTours());
  }, [dispatch]);

  const handleTourPress = async (tour: Tour) => {
    try {
      setIsLoadingDetails(true);
      await dispatch(fetchTourDetails(tour.id)).unwrap();
      setSelectedTour(currentTour);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching tour details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedTour(null);
  };

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TourCard
      item={item}
      handleCardPress={() => handleTourPress(item)}
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
        <Text style={styles.emptyText}>{i18n.t('common.noData')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{i18n.t('tours.availableTours')}</Text>
      
      <FlatList
        data={savedTours} 
        renderItem={renderTourCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {isLoadingDetails && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#AE1913" />
        </View>
      )}

      {selectedTour && (
        <TourDetailsModal
          visible={modalVisible}
          onClose={handleCloseModal}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  listContent: {
    paddingBottom: 16,
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
  errorText: {
    color: '#E53935',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TourListContainer; 