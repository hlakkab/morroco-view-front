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
      imageUrl={'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
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
          name={item.isSaved ? "bookmark" : "bookmark-outline"} 
          size={20} color={item.isSaved ? "#666" : "#000"} />
      }
      onActionPress={() => handleSaveBroker(item.id)}
      onCardPress={() => handleBrokerPress(item)}
      containerStyle={styles.cardContainer}
      svgImage={!item.imageUrl ? <Ionicons name="cash-outline" size={32} color="#fff" /> : undefined}
      isSaved={item.isSaved}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  }
})

export default BrokerCard;
