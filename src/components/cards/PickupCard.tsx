import React, { FC } from 'react';
import { Ionicons } from '@expo/vector-icons';
import CardItem from './CardItem';
import HotelPickupSvg from '../../assets/serviceIcons/car-img.svg';
import { HotelPickup } from '../../types/transport';

interface PickupCardProps {
  item: HotelPickup;
  handleSavePickup: (item: HotelPickup) => void;
  handleCardPress?: (item: HotelPickup) => void;
}

const PickupCard : FC<PickupCardProps> = ({ 
  item, 
  handleSavePickup = () => {}, 
  handleCardPress = () => {} 
}) => {


  return (
    <CardItem
      imageUrl={item.images[0]}
      svgImage={<HotelPickupSvg width={110} height={80} style={{ alignSelf: 'center', marginRight: 10 }} />}
      title={item.title}
      price={{
        value: item.price,
        suffix: 'per group'
      }}
      tags={[
        {
          id: 'pickup',
          label: 'Pickup',
          icon: <Ionicons name="car-outline" size={14} color="#008060" style={{ marginRight: 4 }} />,
          textStyle: { color: '#008060', fontWeight: '500' }
        },
        {
          id: 'type',
          label: item.private ? 'Private Pickup' : 'Shared Pickup',
          textStyle: { color: '#888' }
        }
      ]}
      actionIcon={
        <Ionicons
          name={item.saved ? "bookmark" : "bookmark-outline"}
          size={20}
          color={item.saved ? "#666" : "#000"}
        />
      }
      isSaved={item.saved}
      onActionPress={() => handleSavePickup(item)}
      onCardPress={() => handleCardPress(item)}
    />
  )
}

export default PickupCard;
