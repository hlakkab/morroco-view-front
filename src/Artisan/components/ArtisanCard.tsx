import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { FC } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Artisan } from '../types/Artisan';
import CardItem from '../../components/cards/CardItem';
import { useFirstImage } from '../../utils/useImages';
import { updateArtisanImage } from '../store/artisanSlice';

interface ArtisanCardProps {
  item: Artisan;
  handleSaveArtisan: (item: Artisan) => void;
  handleArtisanPress: (item: Artisan) => void;
}

const ArtisanCard: FC<ArtisanCardProps> = ({ item, handleSaveArtisan, handleArtisanPress }) => {
  // Get artisan code/id for image fetching
  const artisanId = item.code || item.id;
  
  // Use hook to track image loading state
  const { imageUrl, loading } = useFirstImage(artisanId, item.id, item.images, updateArtisanImage);
  
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
          icon: <MaterialIcons name="handyman" size={12} color="#CE1126" />,
          label: item.type,
          style: { backgroundColor: '#FCEBEC', borderWidth: 1, borderColor: '#CE1126' },
          textStyle: { color: '#CE1126', fontWeight: '600' },
        },
      ]}
      actionIcon={
        <Ionicons
          name={item.saved ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={item.saved ? '#666' : '#000'}
        />
      }
      onActionPress={() => handleSaveArtisan(item)}
      onCardPress={() => handleArtisanPress(item)}
      containerStyle={styles.cardContainer}
      svgImage={!hasImage && !loading ? <Ionicons name="hand-left" size={32} color="#fff" /> : loadingPlaceholder}
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

export default ArtisanCard; 