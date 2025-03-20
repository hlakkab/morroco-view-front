import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import custom components
import HeaderContainer from '../containers/HeaderContainer';
import SearchBar from '../components/SearchBar';
import RestaurantListContainer from '../containers/RestaurantListContainer';

// Import types
import { RootStackParamList } from '../types/navigation';
import { Restaurant, RestaurantType } from '../types/Restaurant';
import ScreenHeader from '../components/ScreenHeader';
import ButtonFixe from '../components/ButtonFixe';

// Sample restaurant data
const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    tag: '🍽️ Restau',
    image: 'https://img.freepik.com/photos-gratuite/restaurant-interieur_1127-3394.jpg?t=st=1741963257~exp=1741966857~hmac=ee9980c19139091707fd93c956d19257f64c46f9718b6acc4485fec98208b229&w=1380',
    images: ['https://picsum.photos/200/300','https://img.freepik.com/photos-gratuite/restaurant-interieur_1127-3394.jpg?t=st=1741963257~exp=1741966857~hmac=ee9980c19139091707fd93c956d19257f64c46f9718b6acc4485fec98208b229&w=1380'],
    title: 'Pâtisserie Amandine Marrakech',
    address: '123 Rue de la Pâtisserie',
    startTime: '08:00',
    endTime: '21:00',
    type: RestaurantType.Patisserie,
    // Optionnel : images?: string[]
  },
];

type RestaurantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Restaurant'>;

const RestaurantScreen: React.FC = () => {
  const navigation = useNavigation<RestaurantScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<RestaurantType | 'All Types'>('All Types');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const filteredRestaurants = SAMPLE_RESTAURANTS.filter(
    restaurant =>
      (selectedType === 'All Types' || restaurant.type === selectedType) &&
      (restaurant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Restaurants" />
      </View>
      <View style={styles.content}>
        <SearchBar
            placeholder="Search restaurants..."
            onChangeText={handleSearch}
            value={searchQuery}
            onFilterPress={() => {}}
          />

          <RestaurantListContainer
            restaurants={filteredRestaurants}
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
    },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default RestaurantScreen;
