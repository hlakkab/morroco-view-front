import { Feather, Ionicons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../translations/i18n';
import { Tour } from '../../types/tour';
import CardItem from './CardItem';

// Define the default image using require
const defaultTourImage = require('../../assets/img/nTour_gen.png');

interface TourCardProps {
  item: Tour;
  handleSaveTour?: (item: Tour) => void;
  handleCardPress?: (item: Tour) => void;
}

const TourCard: FC<TourCardProps> = ({
  item,
  handleCardPress = () => { }
}) => {
  // Format the destinations text based on type
  const formatDestinationText = () => {
    if (!item.destinations) return i18n.t('tours.noDestination');
    if (typeof item.destinations === 'string') return i18n.t('tours.oneDestination');
    if (Array.isArray(item.destinations)) {
      const count = item.destinations.length;
      return count === 1 ? i18n.t('tours.oneDestination') : `${count} ${i18n.t('tours.destinations')}`;
    }
    return i18n.t('tours.noDestination');
  };

  // Format dates for display
  const formatDates = () => {
    if (item.from && item.to) {
      // Convert the dates to the desired format
      const fromDate = new Date(item.from);
      const toDate = new Date(item.to);
      
      // Format the dates
      const fromDay = fromDate.getDate();
      const toDay = toDate.getDate();
      const fromMonth = fromDate.toLocaleString('default', { month: 'long' }).toLowerCase();
      const toMonth = toDate.toLocaleString('default', { month: 'long' }).toLowerCase();
      
      // If the months are the same, only show the month once
      if (fromMonth === toMonth) {
        return `${fromDay} - ${toDay} ${fromMonth}`;
      } else {
        return `${fromDay} ${fromMonth} - ${toDay} ${toMonth}`;
      }
    }
    return item.from || i18n.t('tours.noDates');
  };


  return (
      <CardItem
        imageUrl={item.imageUrl || defaultTourImage}
        title={item.title}
        subtitle={`${item.destinationCount} ${i18n.t('tours.destination')}`}
        tags={[
          {
            id: 'date',
            label: formatDates(),
            icon: <Ionicons name="calendar-outline" size={14} color="#008060" style={{ marginRight: 4 }} />,
          },
          // {
          //   id: 'duration',
          //   label: `${item.duration} ${item.duration === 1 ? 'day' : 'days'}`,
          //   icon: <Feather name="clock" size={14} color="#666" style={{ marginRight: 4 }} />,
          // }
        ]}
        // actionIcon={
        //   <Ionicons
        //     name={item.isEditable ? "eye-outline" : "pencil-outline"}
        //     size={20}
        //     color="#115167"
        //     style={{ backgroundColor: '#E0F7FF', borderRadius: 25, padding: 6 }}
        //   />
        // }
        isEditable={item.isEditable}
        onActionPress={() => handleCardPress(item)}
        containerStyle={styles.cardContainer}
        onCardPress={() => handleCardPress(item)}
      />
   
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  }
});

export default TourCard; 