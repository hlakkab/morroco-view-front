import { Ionicons } from '@expo/vector-icons';
import React, { FC } from 'react';
import HotelPickupSvg from '../../assets/serviceIcons/car-img.svg';
import { useLanguage } from '../../contexts/LanguageContext';
import i18n from '../../translations/i18n';
import { HotelPickup } from '../../types/transport';
import CardItem from './CardItem';

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
  const { currentLanguage } = useLanguage();

  return (
    <CardItem
      imageUrl={item.images[0]}
      svgImage={<HotelPickupSvg width={110} height={80} style={{ alignSelf: 'center', marginRight: 10 }} />}
      title={item.title}
      price={{
        value: item.price,
        suffix: i18n.t('pickup.perGroup')
      }}
      tags={[
        {
          id: 'pickup',
          label: i18n.t('pickup.pickup'),
          icon: <Ionicons name="car-outline" size={14} color="#008060" style={{ marginRight: 4 }} />,
          textStyle: { color: '#008060', fontWeight: '500' }
        },
        {
          id: 'type',
          label: item.private ? i18n.t('pickup.privatePickup') : i18n.t('pickup.sharedPickup'),
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
