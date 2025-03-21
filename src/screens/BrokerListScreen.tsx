import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import BrokerListContainer from '../containers/BrokerListContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBrokers, setSelectedLocation } from '../store/exchangeBrokerSlice';
import FilterPopup, {FilterOption} from "../components/FilterPopup";

const BrokerListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  // Get data from Redux store
  const {
    brokers,
    locations,
    selectedLocation,
    loading,
    error
  } = useAppSelector(state => state.exchangeBroker);

  // Filtered brokers based on search query
  const [filteredBrokers, setFilteredBrokers] = useState(brokers);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([
    // Créez vos options de filtrage ici, par exemple :
    {
      id: 'rating_high',
      label: 'Casablanca',
      selected: false,
      category: 'city'
    },
    {
      id: 'rating_low',
      label: 'Rabat',
      selected: false,
      category: 'city'
    },
    // Vous pouvez ajouter d'autres filtres selon vos besoins
  ]);
  const handleFilterPress = () => {
    setFilterVisible(true);
  };

  const handleCloseFilter = () => {
    setFilterVisible(false);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);

    // Appliquez la logique de filtrage ici
    // Par exemple, vous pouvez filtrer les courtiers en fonction des options sélectionnées
    const selected = selectedOptions.filter(option => option.selected);

    // Logique de filtrage basée sur les options sélectionnées
    // ...
  };

  // Fetch brokers on component mount
  useEffect(() => {
    // Fetch brokers with default city (Marrakech)
    dispatch(fetchBrokers('Marrakech')).unwrap();
  }, [dispatch]);

  // Filter brokers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrokers(brokers);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredBrokers(
        brokers.filter(broker =>
          broker.name.toLowerCase().includes(lowercaseQuery) ||
          broker.address.toLowerCase().includes(lowercaseQuery)
        )
      );
    }
  }, [searchQuery, brokers]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSelectLocation = (location: string) => {
    dispatch(setSelectedLocation(location));

    // If a specific city is selected (not "All Locations"), fetch brokers for that city
    if (location !== 'All Locations') {
      dispatch(fetchBrokers(location));
    } else {
      // If "All Locations" is selected, fetch all brokers
      dispatch(fetchBrokers());
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E53935" />
          <Text style={styles.loadingText}>Loading brokers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load brokers</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
      </View>

      <View style={styles.content}>
        <SearchBar
          placeholder="Search for brokers..."
          onChangeText={handleSearch}
          onFilterPress={handleFilterPress}
          value={searchQuery}
        />

        <BrokerListContainer
          brokers={filteredBrokers}
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={handleSelectLocation}
        />

        {/* Ajoutez le popup de filtres */}
        <FilterPopup
            visible={filterVisible}
            onClose={handleCloseFilter}
            filterOptions={filterOptions}
            onApplyFilters={handleApplyFilters}
            title="Filtrer les courtiers"
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default BrokerListScreen;