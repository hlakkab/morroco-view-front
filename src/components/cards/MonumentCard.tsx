import { Monument } from '../../types/Monument';
import CardItem from './CardItem';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

interface MonumentCardProps {
  item: Monument;
  handleSaveMonument: (item: Monument) => void;
  handleMonumentPress: (item: Monument) => void;
}

const MonumentCard: FC<MonumentCardProps> = ({ item, handleSaveMonument, handleMonumentPress }) => {
  return (
    <CardItem
      imageUrl={item.images?.[0]}
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
        prefix: 'Entry from'
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
      svgImage={<Ionicons name="business" size={32} color="#fff" />}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 10,
  }
});

export default MonumentCard; 