import { Feather, Ionicons } from '@expo/vector-icons';
import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Tour } from '../../types/tour';
import CardItem from './CardItem';

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
    if (!item.destinations) return '0 Destination';
    if (typeof item.destinations === 'string') return '1 Destination';
    if (Array.isArray(item.destinations)) {
      const count = item.destinations.length;
      return `${count} ${count === 1 ? 'Destination' : 'Destinations'}`;
    }
    return '0 Destination';
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
    return item.from || 'No dates';
  };

  const defaultImage = "https://orioly.com/wp-content/uploads/2016/12/qualities-of-a-good-tour-guide-cover-illustration.png";

  return (
      <CardItem
        imageUrl={defaultImage}
        title={item.title}
        subtitle={`${item.destinationCount} Destination`}
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