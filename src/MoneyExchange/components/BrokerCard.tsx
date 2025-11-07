import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Broker } from '../types/exchange-broker';
import CardItem from '../../components/cards/CardItem';
import { useFirstImage } from '../../utils/useImages';
import { updateBrokerImage } from '../store/exchangeBrokerSlice';

interface BrokerCardProps {
  item: Broker;
  handleSaveBroker?: (id: string) => void;
  handleBrokerPress?: (item: Broker) => void;
}

const BrokerCard = ({ item, handleSaveBroker, handleBrokerPress }: BrokerCardProps) => {
  // Get broker id for image fetching (Broker type uses id instead of code)
  const brokerId = item.id;
  
  // Use hook to fetch first image asynchronously
  const { imageUrl, loading } = useFirstImage(
    brokerId,
    item.id,
    item.images,
    updateBrokerImage
  );

  // Use fetched image if available, otherwise use existing images
  const displayImages = imageUrl ? [imageUrl] : (item.images || []);

  // Show loading placeholder while image is being fetched
  const loadingPlaceholder = loading && (!item.images || item.images.length === 0) ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#008060" />
    </View>
  ) : undefined;

  return (
    <CardItem
      images={displayImages}
      title={item.name}
      subtitle={item.address}
      tags={[
        {
          id: 'broker',
          label: 'BROKER',
          icon: <Ionicons name="cash-outline" size={12} color="#008060" style={{ marginRight: 4 }} />,
          style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
          textStyle: { color: '#008060', fontWeight: '600' }
        },
        ...(item.isFeatured ? [{
          id: 'partner',
          label: 'PARTNER',
          style: { backgroundColor: '#E53935' },
          textStyle: { color: '#fff' }
        }] : [])
      ]}
      actionIcon={
        <Ionicons 
          name={item.saved ? "bookmark" : "bookmark-outline"} 
          size={20} color={item.saved ? "#666" : "#000"} />
      }
      onActionPress={() => handleSaveBroker?.(item.id)}
      onCardPress={() => handleBrokerPress?.(item)}
      containerStyle={styles.cardContainer}
      svgImage={loadingPlaceholder || (!displayImages || displayImages.length === 0 ? <Ionicons name="cash-outline" size={32} color="#fff" /> : undefined)}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  }
})

export default BrokerCard;
