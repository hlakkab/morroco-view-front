import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import RestaurantCard from '../components/cards/RestaurantCard';
import FilterSelector from '../components/FilterSelector';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch } from '../store/hooks';
import { setSelectedRestaurant, toggleRestaurantBookmark } from '../store/restaurantSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import { Restaurant, RestaurantType } from '../types/Restaurant';

interface RestaurantListContainerProps {
  restaurants: Restaurant[];
  selectedType: RestaurantType | 'All Types';
  onSelectType: (type: RestaurantType | 'All Types') => void;
  showTypeFilter?: boolean;
}

const RestaurantListContainer: React.FC<RestaurantListContainerProps> = ({
  restaurants,
  selectedType,
  onSelectType,
  showTypeFilter = true,
}) => {
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      label: i18n.t('restaurants.allTypes'),
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
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    dispatch(toggleRestaurantBookmark(restaurant));
  };

  // Determine the empty state message based on filter conditions
  const getEmptyStateMessage = () => {
    if (restaurants.length === 0) {
      return i18n.t('restaurants.noRestaurantsAvailable');
    } else if (filteredRestaurants.length === 0 && selectedType !== 'All Types') {
      return `${i18n.t('restaurants.noRestaurantsType')} ${selectedType}`;
    } else {
      return i18n.t('restaurants.noRestaurantsFilters');
    }
  };

  return (
    <View style={styles.container}>
      {showTypeFilter && (
        <View style={styles.filtersContainer}>
          <FilterSelector
            title={i18n.t('restaurants.restaurantType')}
            options={typeOptions}
            selectedOptionId={selectedType}
            onSelectOption={(optionId) => onSelectType(optionId as RestaurantType | "All Types")}
          />
        </View>
      )}
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
          <Text style={styles.emptyText}>{getEmptyStateMessage()}</Text>
        </View>
      )}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
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
    marginBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default RestaurantListContainer;
