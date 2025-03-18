import { Ionicons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Tour } from '../../types/tour';
import CardItem from './CardItem';

interface TourCardProps {
  item: Tour;
  handleSaveTour?: (item: Tour) => void;
  handleCardPress?: (item: Tour) => void;
}

const TourCard: FC<TourCardProps> = ({ 
  item, 
  handleCardPress = () => {} 
}) => {
  return (
    <CardItem
      imageUrl={item.imageUrl}
      title={item.title}
      subtitle={`${item.destinations.length} Destination`}
      tags={[
        {
          id: 'date',
          label: item.startDate,
          icon: <Ionicons name="calendar-outline" size={14} color="#008060" style={{ marginRight: 4 }} />,
        }
      ]}
      actionIcon={
        <Ionicons
          name="pencil-outline"
          size={20}
          color="#115167"
          style={{ backgroundColor: '#E0F7FF', borderRadius: 25, padding: 6}}
        />
      }
      isEditable={item.isEditable}
      onActionPress={() => handleCardPress(item)}
      containerStyle={styles.cardContainer}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  }
});

export default TourCard; 