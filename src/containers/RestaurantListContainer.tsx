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
import { useAppDispatch } from '../store/hooks';
import { setSelectedRestaurant, toggleRestaurantBookmark } from '../store/restaurantSlice';
import RestaurantCard from '../components/cards/RestaurantCard';

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
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const dispatch = useAppDispatch();

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
    dispatch(setSelectedRestaurant(restaurant));
    navigation.navigate('RestaurantDetail', restaurant);
  };

  const handleSaveRestaurant = (restaurant: Restaurant) => {
    dispatch(toggleRestaurantBookmark(restaurant));
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <FilterSelector
         title="Restaurant Type:"
          options={typeOptions}
          selectedOptionId={selectedType}
          onSelectOption={(optionId) => onSelectType(optionId as RestaurantType | "All Types")}
        />
      </View>
      {filteredRestaurants.length > 0 ? (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard
              item={item}
              handleSaveRestaurant={handleSaveRestaurant}
              handleRestaurantPress={handleRestaurantPress}
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
    flexDirection: 'row',
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  listContent: {
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
