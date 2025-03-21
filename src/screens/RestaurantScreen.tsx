import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import custom components
import HeaderContainer from '../containers/HeaderContainer';
import SearchBar from '../components/SearchBar';
import RestaurantListContainer from '../containers/RestaurantListContainer';
import FilterPopup, { FilterOption } from '../components/FilterPopup'; // Importer FilterPopup

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
    city: 'Marrakech',
    // Optionnel : images?: string[]
  },
  {
    id: '2',
    tag: '☕ Café',
    image: 'https://picsum.photos/200/300',
    images: ['https://picsum.photos/200/300'],
    title: 'Café des Épices',
    address: '45 Avenue Mohammed V',
    startTime: '07:00',
    endTime: '22:00',
    type: RestaurantType.Contemporary,
    city: 'Rabat',
  },
  {
    id: '3',
    tag: '🍽️ Restau',
    image: 'https://picsum.photos/200/300',
    images: ['https://picsum.photos/200/300'],
    title: 'Restaurant Dar Essalam',
    address: '15 Rue Riad Zitoun',
    startTime: '12:00',
    endTime: '23:00',
    type: RestaurantType.Traditional,
    city: 'Marrakech'
  },
  {
    id: '4',
    tag: '🍔 Fast',
    image: 'https://picsum.photos/200/300',
    images: ['https://picsum.photos/200/300'],
    title: 'Burger Palace',
    address: '78 Boulevard Anfa',
    startTime: '11:00',
    endTime: '23:00',
    type: RestaurantType.FastCasual,
    city: 'Casablanca'
  },
];

type RestaurantScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Restaurant'>;

const RestaurantScreen: React.FC = () => {
  const navigation = useNavigation<RestaurantScreenNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<RestaurantType | 'All Types'>('All Types');

  // État pour gérer la visibilité du popup de filtres
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);

// Options de filtres pour le popup
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>(() => {
    // Extraire toutes les villes uniques des données
    const uniqueCities = [...new Set(SAMPLE_RESTAURANTS.map(restaurant => restaurant.city))];

    return [
     /* // Options pour le type de restaurant
      ...Object.values(RestaurantType).map(type => ({
        id: type,
        label: type,
        selected: selectedType === type,
        category: 'type'
      })),*/
      // Options pour les villes
      ...uniqueCities.map(city => ({
        id: city,
        label: city,
        selected: false,
        category: 'city'
      }))
    ];
  });

  // Mettre à jour les options de filtre lorsque selectedType change
  useEffect(() => {
    setFilterOptions(prevOptions =>
        prevOptions.map(option => {
          if (option.category === 'type') {
            return {
              ...option,
              selected: selectedType === option.id
            };
          }
          return option;
        })
    );
  }, [selectedType]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  // Fonction pour ouvrir le popup de filtres
  const handleFilterPress = () => {
    setFilterPopupVisible(true);
  };

  // Fonction pour appliquer les filtres du popup
  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    // Mettre à jour les options de filtre
    setFilterOptions(selectedOptions);
  /*
    // Trouver le type de restaurant sélectionné
    const selectedTypeOption = selectedOptions.find(
        option => option.category === 'type' && option.selected
    );

    // Si un type est sélectionné, mettre à jour selectedType
    if (selectedTypeOption) {
      setSelectedType(selectedTypeOption.id as RestaurantType);
    } else {
      setSelectedType('All Types');
    }

    // Tu peux ajouter d'autres logiques de filtrage ici (ville, prix, etc.)
  */
  };

  // Filtrer les restaurants en fonction des critères de recherche et de filtrage
  const filteredRestaurants = SAMPLE_RESTAURANTS.filter(restaurant => {
    // Filtrer par type (déjà géré dans RestaurantListContainer)
    const typeRestau = selectedType === 'All Types' || restaurant.type === selectedType;

    // Filtrer par recherche
    const searchRestaurant =
        restaurant.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtrer par ville (exemple d'un filtre supplémentaire)
    const cityFilters = filterOptions
        .filter(option => option.category === 'city' && option.selected)
        .map(option => option.id);

    const cityRestau = cityFilters.length === 0 || cityFilters.includes(restaurant.city);

    return typeRestau && searchRestaurant && cityRestau;
  });

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
              onFilterPress={handleFilterPress}
          />

          <RestaurantListContainer
              restaurants={filteredRestaurants}
              selectedType={selectedType}
              onSelectType={setSelectedType}
          />

          {/* Ajouter le composant FilterPopup */}
          <FilterPopup
              visible={filterPopupVisible}
              onClose={() => setFilterPopupVisible(false)}
              filterOptions={filterOptions}
              onApplyFilters={handleApplyFilters}
              title="Filtrer les restaurants"
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