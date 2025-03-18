import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import FilterSelector from '../components/FilterSelector';
import TourCard from '../components/cards/TourCard';



const TourListContainer: React.FC = () => {
  const navigation = useNavigation();

  // Sample tour data - replace with actual data later
  const tours = [
    {
      id: '1',
      title: 'My Africa Cup of Nations Tour',
      imageUrl: 'https://example.com/africa-cup.jpg',
      destinations: ['Morocco', 'Ivory Coast', 'Senegal', 'Egypt', 'Tunisia'],
      startDate: 'Start Mon 12 Oct',
      city: 'Multiple',
      duration: 15,
      isEditable: true
    }
  ];

  const handleEditTour = (tour: any) => {
    console.log('Edit tour:', tour);
  };

  const renderTourCard = ({ item }: { item: any }) => (
    <TourCard
      item={item}
      handleCardPress={() => handleEditTour(item)}
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