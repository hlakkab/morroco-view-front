import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Broker } from "../../types/exchange-broker";
import CardItem from "./CardItem";

interface BrokerCardProps {
  item: Broker;
  handleSaveBroker?: (id: string) => void;
  handleBrokerPress?: (item: Broker) => void;
}

const BrokerCard = ({ item, handleSaveBroker, handleBrokerPress }: BrokerCardProps) => {
  return (
    <CardItem
      images={item.images}
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
      svgImage={!item.images || item.images.length === 0 ? <Ionicons name="cash-outline" size={32} color="#fff" /> : undefined}
      isSaved={item.saved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  }
})

export default BrokerCard;
