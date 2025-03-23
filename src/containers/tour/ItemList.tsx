import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CardItem from '../../components/cards/CardItem';

export interface SavedItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  city: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}

interface ItemListProps {
  items: SavedItem[];
  selectedCity: string;
  selectedItems: string[];
  totalSelectedCount: number;
  onSelectItem: (itemId: string, itemCity: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  selectedCity,
  selectedItems,
  totalSelectedCount,
  onSelectItem,
}) => {

  const getIconForType = (type: string) => {
    switch(type) {
      case 'hotel':
        return <Ionicons name="bed-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'restaurant':
        return <Ionicons name="restaurant-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'match':
        return <Ionicons name="football-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'entertainment':
        return <Ionicons name="musical-notes-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      default:
        return <Ionicons name="location-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
    }
  };

  const renderSavedItem = ({ item }: { item: SavedItem }) => {
    const isSelected = selectedItems.includes(item.id);
    const isDisabled = selectedCity && item.city !== selectedCity;

    return (
      <View style={styles.cardContainer}>
        <CardItem
          imageUrl={item.imageUrl}
          title={item.title}
          subtitle={item.subtitle}
          tags={[
            {
              id: item.type,
              label: item.type.charAt(0).toUpperCase() + item.type.slice(1),
              icon: getIconForType(item.type)
            },
            {
              id: `city-${item.city}`,
              label: item.city,
              icon: <Ionicons name="location" size={14} color="#008060" style={{ marginRight: 4 }} />
            }
          ]}
          actionIcon={
            <Ionicons
              name={isSelected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={32}
              color={isSelected ? "#E53935" : isDisabled ? "#ccc" : "#666"}
            />
          }
          onActionPress={() => {
            if (!isDisabled) {
              onSelectItem(item.id, item.city);
            }
          }}
          containerStyle={[
            styles.card,
            isDisabled && styles.disabledCard
          ]}
          imageStyle={styles.cardImage}
          contentStyle={isDisabled ? styles.disabledCardContent : {}}
        />
      </View>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Items in {selectedCity}</Text>
        <Text style={styles.selectedCount}>{totalSelectedCount} selected</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderSavedItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found for this city</Text>
          </View>
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectedCount: {
    fontSize: 14,
    color: '#E53935',
    fontWeight: '500',
  },
  cardContainer: {
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  disabledCardContent: {
    opacity: 0.7,
  },
  cardImage: {
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    resizeMode: 'cover',
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default ItemList; 