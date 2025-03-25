import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import FilterSelector from '../components/FilterSelector';
import TourDetailsModal from '../components/TourDetailsModal';
import TourCard from '../components/cards/TourCard';
import { Destination, Tour } from '../types/tour';

const TourListContainer: React.FC = () => {
  const navigation = useNavigation();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Sample destinations data with real online images
  const destinations: Destination[] = [
    {
      id: '1',
      type: 'hotel',
      title: 'Four Seasons Hotel',
      city: 'Casablanca',
      imageUrl: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/223648290.jpg?k=d7042c5905373d5f217992f67cfb1a1a5a5559a0a2ad4b3ce7536e2848a1bc37&o=&hp=1'
    },
    {
      id: '2',
      type: 'restaurant',
      title: 'Köyă Restaurant',
      city: 'Marrakech',
      imageUrl: 'https://media-cdn.tripadvisor.com/media/photo-p/1c/cc/51/db/koya.jpg'
    },
    {
      id: '3',
      type: 'match',
      title: 'Morocco Vs Comores',
      city: 'Rabat',
      imageUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'
    },
    {
      id: '4',
      type: 'entertainment',
      title: 'Desert Safari',
      city: 'Marrakech',
      imageUrl: 'https://images.pexels.com/photos/4062561/pexels-photo-4062561.jpeg'
    },
    {
      id: '5',
      type: 'hotel',
      title: 'Mamounia Palace',
      city: 'Marrakech',
      imageUrl: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg'
    }
  ];

  // Sample tour data with real online image
  const tours: Tour[] = [
    {
      id: '1',
      title: 'Africa Cup Of Nations Tour',
      imageUrl: 'https://www.moroccoworldnews.com/wp-content/uploads/2023/05/Morocco-to-Host-2025-AFCON-Tournament-After-Guinea-Withdrawal.jpg',
      destinations: destinations,
      startDate: '03/Oct',
      endDate: '11/Oct',
      city: 'Multiple',
      duration: 5,
      totalDestinations: 5,
      isEditable: true
    }
  ];

  const handleTourPress = (tour: Tour) => {
    setSelectedTour(tour);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TourCard
      item={item}
      handleCardPress={() => handleTourPress(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Tours</Text>
      
      <FlatList
        data={tours}
        renderItem={renderTourCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {selectedTour && (
        <TourDetailsModal
          visible={modalVisible}
          title={selectedTour.title}
          onClose={handleCloseModal}
          destinations={selectedTour.destinations as Destination[]}
          totalDestinations={selectedTour.totalDestinations || 0}
          duration={selectedTour.duration}
          startDate={selectedTour.startDate}
          endDate={selectedTour.endDate}
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