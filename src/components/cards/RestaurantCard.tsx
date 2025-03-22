import { Restaurant } from '../../types/Restaurant';
import CardItem from './CardItem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { toggleRestaurantBookmark } from '../../store/restaurantSlice';

interface RestaurantCardProps {
  item: Restaurant;
  handleSaveRestaurant: (item: Restaurant) => void;
  handleRestaurantPress: (item: Restaurant) => void;
}

const RestaurantCard: FC<RestaurantCardProps> = ({ item, handleSaveRestaurant, handleRestaurantPress }) => {

  return (
    <CardItem
      imageUrl={item.images?.[0]}
      title={item.name}
      subtitle={item.address}
      tags={[
        {
          id: 'type',
          icon: <MaterialIcons name="restaurant" size={12} color="green" />,
          label: "Restaurant",
          style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
          textStyle: { color: '#008060', fontWeight: '600' },
        },
      ]}
      actionIcon={
        <Ionicons
          name={item.saved ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={item.saved ? '#666' : '#000'}
        />
      }
      onActionPress={() => handleSaveRestaurant(item)}
      onCardPress={() => handleRestaurantPress(item)}
      containerStyle={styles.cardContainer}
      svgImage={<Ionicons name="restaurant-outline" size={32} color="#fff" />}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 10,
  }
});

export default RestaurantCard;
