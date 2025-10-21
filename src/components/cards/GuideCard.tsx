import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import i18n from '../../translations/i18n';
import { Guide } from "../../types/guide";
import CardItem from "./CardItem";

interface GuideCardProps {
  item: Guide;
  handleSaveGuide?: (id: string) => void;
  handleGuidePress?: (item: Guide) => void;
}

const GuideCard = ({ item, handleSaveGuide, handleGuidePress }: GuideCardProps) => {
  // Format subtitle with languages and experience
  const languagesText = item.languages.slice(0, 2).join(', ') + (item.languages.length > 2 ? `... +${item.languages.length - 2}` : '');
  const subtitle = `${item.region} • ${item.experienceYears} ${i18n.t('guide.yearsExperience')}\n${languagesText}`;
  
  return (
    <CardItem
      images={item.images}
      title={item.name}
      subtitle={subtitle}
      price={{
        value: item.priceHalfDay,
        prefix: i18n.t('guide.from'),
        currency: item.currency
      }}
      tags={[
        {
          id: 'guide',
          label: 'GUIDE',
          icon: <Ionicons name="person-outline" size={12} color="#CE1126" style={{ marginRight: 4 }} />,
          style: { backgroundColor: '#FCE4E4', borderWidth: 1, borderColor: '#CE1126' },
          textStyle: { color: '#CE1126', fontWeight: '600' }
        },
        {
          id: 'rating',
          label: `★ ${item.rating.toFixed(1)} (${item.reviewCount})`,
          style: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFA726' },
          textStyle: { color: '#F57C00', fontWeight: '600' }
        }
      ]}
      actionIcon={
        <Ionicons 
          name={item.saved ? "bookmark" : "bookmark-outline"} 
          size={20} 
          color={item.saved ? "#666" : "#000"} 
        />
      }
      onActionPress={() => handleSaveGuide?.(item.id)}
      onCardPress={() => handleGuidePress?.(item)}
      containerStyle={styles.cardContainer}
      svgImage={!item.images || item.images.length === 0 ? <Ionicons name="person-outline" size={32} color="#fff" /> : undefined}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
});

export default GuideCard;

