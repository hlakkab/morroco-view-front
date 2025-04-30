import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import CardItem from '../../components/cards/CardItem';
import i18n from '../../translations/i18n';
import { TourSavedItem } from '../../types/tour';
import { getFlagUrl } from '../../utils/flagResolver';



interface ItemListProps {
  items: TourSavedItem[];
  selectedCity: string;
  selectedItems: string[];
  totalSelectedCount: number;
  previouslySelectedItemIds: string[];   // ← ajoute ceci
  onSelectItem: (itemId: string, itemCity: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  selectedCity,
  selectedItems,
  totalSelectedCount,
  previouslySelectedItemIds,
  onSelectItem,   // ← ici  onSelectItem,
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
      case 'monument':
        return <Ionicons name="business-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      case 'money-exchange':
        return <Ionicons name="cash-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
      default:
        return <Ionicons name="location-outline" size={14} color="#008060" style={{ marginRight: 4 }} />;
    }
  };

  const renderSavedItem = ({ item }: { item: TourSavedItem }) => {
    const isSelected = selectedItems.includes(item.id);
    const isPreviouslySelected = previouslySelectedItemIds.includes(item.id);
    const isDisabled = selectedCity && item.city !== selectedCity;

    const renderMatchContent = () => {
      const teams = item.title.split(' vs ');
      if (teams.length !== 2) return null;
      
      return (
        <View style={styles.matchContainer}>
          <Image source={{ uri: getFlagUrl(teams[0]) }} style={styles.teamFlag} />
          <Text style={styles.vsText}>{i18n.t('matches.vs')}</Text>
          <Image source={{ uri: getFlagUrl(teams[1]) }} style={styles.teamFlag} />
        </View>
      );
    };

    return (
        <View style={styles.cardWrapper}>
          <CardItem
              images={item.type === 'match' ? [] : item.images}
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
              containerStyle={[styles.card, isDisabled && styles.disabledCard]}
              imageStyle={styles.cardImage}
              contentStyle={isDisabled ? styles.disabledCardContent : {}}
              svgImage={item.type === 'match' ? renderMatchContent() : undefined}
          />

          {isPreviouslySelected && (
              <View style={styles.alreadyBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#E53935" />
                <Text style={styles.badgeText}>{i18n.t('tours.alreadySelected')}</Text>
              </View>
          )}
        </View>
    );

  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('tours.itemsInCity').replace('{city}', selectedCity)}</Text>
        <Text style={styles.selectedCount}>{i18n.t('tours.selectedCount').replace('{count}', totalSelectedCount.toString())}</Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderSavedItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{i18n.t('tours.noItemsFound')}</Text>
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
  matchContainer: {
    width: 120,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F6FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginRight: 10,
    paddingHorizontal: 6,
  },
  teamFlag: {
    width: 36,
    height: 26,
    borderRadius: 5,
  },
  vsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
  },
  cardWrapper: {
    position: 'relative',
  },
  alreadyBadge: {
    position: 'absolute',
    //bottom: 15.96,
    top: 0.15,
    right: 0.005,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8D7DA',
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderRadius: 8,
    borderTopRightRadius :8,
    borderBottomRightRadius :0,
    borderTopLeftRadius :0,
  },
  badgeText: {
    fontSize: 10,
    color: '#E53935',
    marginLeft: 1,
  },
});

export default ItemList; 