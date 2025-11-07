import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { FC } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import i18n from '../../translations/i18n';
import { Monument } from '../types/Monument';
import CardItem from '../../components/cards/CardItem';
import { useFirstImage } from '../../utils/useImages';
import { updateMonumentImage } from '../store/monumentSlice';

interface MonumentCardProps {
  item: Monument;
  handleSaveMonument: (item: Monument) => void;
  handleMonumentPress: (item: Monument) => void;
}

const MonumentCard: FC<MonumentCardProps> = ({ item, handleSaveMonument, handleMonumentPress }) => {
  // Get monument code/id for image fetching
  const monumentId = item.code || item.id;
  
  // Use hook to track image loading state
  const { imageUrl, loading } = useFirstImage(monumentId, item.id, item.images, updateMonumentImage);
  
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
          icon: <MaterialIcons name="account-balance" size={12} color="#008060" />,
          label: "Monument",
          style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
          textStyle: { color: '#008060', fontWeight: '600' },
        },
      ]}
      price={item.entryFee ? {
        value: parseInt(item.entryFee) || 0,
        currency: 'MAD',
        prefix: i18n.t('monuments.entryFrom')
      } : undefined}
      actionIcon={
        <Ionicons
          name={item.saved ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={item.saved ? '#666' : '#000'}
        />
      }
      onActionPress={() => handleSaveMonument(item)}
      onCardPress={() => handleMonumentPress(item)}
      containerStyle={styles.cardContainer}
      svgImage={!hasImage && !loading ? <Ionicons name="business" size={32} color="#fff" /> : loadingPlaceholder}
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

export default MonumentCard; 