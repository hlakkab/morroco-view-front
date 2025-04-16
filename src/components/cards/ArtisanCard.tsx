import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import { Artisan } from '../../types/Artisan';
import CardItem from './CardItem';

interface ArtisanCardProps {
  item: Artisan;
  handleSaveArtisan: (item: Artisan) => void;
  handleArtisanPress: (item: Artisan) => void;
}

const ArtisanCard: FC<ArtisanCardProps> = ({ item, handleSaveArtisan, handleArtisanPress }) => {

  return (
    <CardItem
      imageUrl={item.images?.[0]}
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
      svgImage={<Ionicons name="hand-left" size={32} color="#fff" />}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 10,
  }
});

export default ArtisanCard; 