import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CardItem from '../components/cards/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../types/navigation';
import { Restaurant, RestaurantType } from '../types/Restaurant';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';




interface RestaurantListContainerProps {
  restaurants: Restaurant[];
  selectedType: RestaurantType | 'All Types';
  onSelectType: (type: RestaurantType | 'All Types') => void;
}

const RestaurantListContainer: React.FC<RestaurantListContainerProps> = ({
  restaurants,
  selectedType,
  onSelectType,
}) => {
  const [savedRestaurants, setSavedRestaurants] = useState<Record<string, boolean>>({});
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);

  // Filtrer les restaurants selon le type sélectionné
  useEffect(() => {
    if (selectedType === 'All Types') {
      setFilteredRestaurants(restaurants);
    } else {
      setFilteredRestaurants(restaurants.filter(restaurant => restaurant.type === selectedType));
    }
  }, [selectedType, restaurants]);

  // Options de filtres pour les types de restaurants
  const typeOptions = [
    {
      id: 'All Types',
      label: 'All Types',
      icon: <Ionicons name="restaurant-outline" size={16} color="#888" style={{ marginRight: 4 }} />,
    },
    ...Object.values(RestaurantType).map(type => ({
      id: type,
      label: type,
      icon: <Ionicons name="restaurant-outline" size={16} color="#888" style={{ marginRight: 4 }} />,
    })),
  ];

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetail', {
      id: restaurant.id,
      title: restaurant.title,
      image: restaurant.image, // propriété requise ajoutée
      images: restaurant.images && restaurant.images.length > 0 ? restaurant.images : [restaurant.image],
      address: restaurant.address,
      startTime: restaurant.startTime,
      endTime: restaurant.endTime,
    });
  };

  


  const handleSaveRestaurant = (id: string) => {
    setSavedRestaurants(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <FilterSelector
       //   title="Restaurant Type:"
          options={typeOptions}
          selectedOptionId={selectedType}
          onSelectOption={(optionId) => onSelectType(optionId as RestaurantType | "All Types")}
          containerStyle={styles.filterContainer}
        />
      </View>
      {filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardItem
              imageUrl={item.image}
              title={item.title}
              subtitle={item.address}
              tags={[
                {
                  id: 'type',
                  //label: item.tag, //.toUpperCase(),
                  icon: <MaterialIcons name="restaurant" size={12} color="green"/>,
                  label:  item.type,
                  style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
                  textStyle: { color: '#008060', fontWeight: '600' },
                },
              ]}
              actionIcon={
                <Ionicons
                  name={savedRestaurants[item.id] ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={savedRestaurants[item.id] ? '#666' : '#000'}
                />
              }
              onActionPress={() => handleSaveRestaurant(item.id)}
              onCardPress={() => handleRestaurantPress(item)}
              containerStyle={styles.cardContainer}
              svgImage={!item.image ? <Ionicons name="restaurant-outline" size={32} color="#fff" /> : undefined}
              isSaved={savedRestaurants[item.id]}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No restaurants found in this type</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterContainer: {
    marginTop: -9,
    marginBottom: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default RestaurantListContainer;
