import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { FC } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAppDispatch } from '../../store/hooks';
import { toggleRestaurantBookmark, updateRestaurantImage } from '../store/restaurantSlice';
import i18n from '../../translations/i18n';
import { Restaurant } from '../types/Restaurant';
import CardItem from '../../components/cards/CardItem';
import { useFirstImage } from '../../utils/useImages';

interface RestaurantCardProps {
  item: Restaurant;
  handleSaveRestaurant: (item: Restaurant) => void;
  handleRestaurantPress: (item: Restaurant) => void;
}

const RestaurantCard: FC<RestaurantCardProps> = ({ item, handleSaveRestaurant, handleRestaurantPress }) => {
  // Get restaurant code/id for image fetching
  const restaurantId = item.code || item.id;
  
  // Use hook to track image loading state
  const { imageUrl, loading } = useFirstImage(restaurantId, item.id, item.images, updateRestaurantImage);
  
  // Use fetched image or existing image
  const displayImage = imageUrl || (item.images && item.images.length > 0 ? item.images[0] : undefined);
  const hasImage = !!displayImage;
  
  // Show loading indicator if image is being fetched
  const loadingPlaceholder = loading && !hasImage ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#008060" />
    </View>
  ) : undefined;

  return (
    <CardItem
      imageUrl={displayImage}
      title={item.name}
      subtitle={item.address}
      tags={[
        {
          id: 'type',
          icon: <MaterialIcons name="restaurant" size={12} color="green" />,
          label: i18n.t('restaurants.restaurant'),
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
      svgImage={!hasImage && !loading ? <Ionicons name="restaurant-outline" size={32} color="#fff" /> : loadingPlaceholder}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 10,
  },
  loadingContainer: {
    width: 120,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
});

export default RestaurantCard;
