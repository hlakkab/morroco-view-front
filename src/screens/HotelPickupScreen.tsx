import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import FilterPopup, { FilterOption } from '../components/FilterPopup'; // Ajout de l'import
import HotelPickupListContainer from '../containers/HotelPickupListContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHotelPickups, setSelectedFromCity, setSelectedToCity, setSearchQuery } from '../store/hotelPickupSlice';



const CITIES = ['Marrakech', 'Rabat', 'Agadir', 'Casablanca', 'Fes', 'Tanger'];

const HotelPickupScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const {
    hotelPickups,
    selectedFromCity,
    selectedToCity,
    searchQuery,
    loading,
    error
  } = useAppSelector(
      (state) => state.hotelPickup
  );

  // Use sample data while testing
  const [useSampleData, setUseSampleData] = useState(false);

  // Ajout de l'état pour le FilterPopup
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);

  // Définir les options de filtre
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    // Options pour les villes de départ
    ...CITIES.map(city => ({
      id: `from-${city}`,
      label: city,
      selected: city === selectedFromCity,
      category: 'Ville de départ'
    })),
    // Options pour les villes d'arrivée
    ...CITIES.map(city => ({
      id: `to-${city}`,
      label: city,
      selected: city === selectedToCity,
      category: 'Ville d\'arrivée'
    })),
    // Ajoutez d'autres catégories au besoin
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchHotelPickups(selectedFromCity)).unwrap();
      } catch (error) {
        console.error('Failed to fetch hotel pickups:', error);
        setUseSampleData(true); // Fallback to sample data if API fails
      }
    };

    fetchData();
  }, [dispatch, selectedFromCity]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleFilter = () => {
    // Ouvrir le popup de filtre
    setFilterPopupVisible(true);
  };

  const handleSelectCity = (city: string, type: 'from' | 'to') => {
    if (type === 'from') {
      dispatch(setSelectedFromCity(city));
    } else {
      dispatch(setSelectedToCity(city));
    }
  };

  // Fonction pour appliquer les filtres sélectionnés
  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    // Traiter les options sélectionnées
    const fromCity = selectedOptions
        .find(option => option.category === 'Ville de départ' && option.selected)?.label;

    const toCity = selectedOptions
        .find(option => option.category === 'Ville d\'arrivée' && option.selected)?.label;

    if (fromCity) {
      dispatch(setSelectedFromCity(fromCity));
    }

    if (toCity) {
      dispatch(setSelectedToCity(toCity));
    }

    // Mettre à jour les options de filtre
    setFilterOptions(selectedOptions);
  };

  if (loading) {
    return (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#000" />
        </View>
    );
  }

  if (error && !useSampleData) {
    return (
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <ScreenHeader title="Hotel Pickup" onBack={handleBack} />
        </View>

        <View style={styles.content}>
          <SearchBar
              placeholder="Search for hotel..."
              onChangeText={handleSearch}
              onFilterPress={handleFilter}
              value={searchQuery}
          />
          <HotelPickupListContainer
              pickups={hotelPickups}
              cities={CITIES}
              selectedFromCity={selectedFromCity}
              selectedToCity={selectedToCity}
              onSelectCity={handleSelectCity}
              isLoading={loading}
          />
        </View>

        {/* Intégration du FilterPopup */}
        <FilterPopup
            visible={filterPopupVisible}
            onClose={() => setFilterPopupVisible(false)}
            filterOptions={filterOptions}
            onApplyFilters={handleApplyFilters}
            title="Filtrer les hôtels"
        />
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});

export default HotelPickupScreen;