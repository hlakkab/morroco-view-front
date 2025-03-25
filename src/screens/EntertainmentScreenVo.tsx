import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import EntertainmentListContainerVo from '../containers/EntertainmentListContainerVo';
import { EntertainmentState, fetchEntertainments } from '../store/entertainmentSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { Entertainment } from '../types/Entertainment';
import { RootStackParamList } from '../types/navigation';
import FilterSelector from '../components/FilterSelector';
import FilterPopup, { FilterOption } from '../components/FilterPopup';

type EntertainmentScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Entertainment'>;

const EntertainmentScreenVo: React.FC = () => {
  const navigation = useNavigation<EntertainmentScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPopupVisible, setFilterPopupVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

  const [selectedCityId, setSelectedCityId] = useState('5408');

  const { entertainments, loading, error } = useAppSelector(
    (state): EntertainmentState => state.entertainment
  );

  // City filter options for Marrakech and Casablanca
  const cityFilterOptions = [
    { id: '5408', label: 'Marrakech' },
    { id: '4396', label: 'Casablanca' },
    { id: '4388', label: 'Tangier'},
  ];

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    
    // Fetch entertainments with the selected city code
    if (cityId === 'all') {
      fetchEntertainmentData();
    } else {
      fetchEntertainmentData(cityId);
    }
  };

  const fetchEntertainmentData = async (cityCode?: string) => {
    try {
      await dispatch(fetchEntertainments(cityCode || '5408')).unwrap();
    } catch (error) {
      console.error('Failed to fetch entertainments:', error);
    }
  };

  useEffect(() => {
    // Initial data fetch with default city
    fetchEntertainmentData();
  }, [dispatch]);

  // Initialiser les options de filtre à partir des entertainments (ex : par localisation)
  useEffect(() => {
    if (entertainments.length > 0 && filterOptions.length === 0) {
      const uniqueLocations = Array.from(new Set(entertainments.map(ent => ent.location)));
      const locationOptions = uniqueLocations.map(location => ({
        id: location,
        label: location,
        selected: false,
        category: 'location'
      }));
// Extraire les villes uniques (supposons qu'il y ait la propriété "city")
      const uniqueCities = Array.from(new Set(entertainments.map(ent => ent.city)));
      const cityOptions = uniqueCities.map(city => ({
        id: city,
        label: city,
        selected: false,
        category: 'city'
      }));

      // Combine les deux ensembles d'options
      setFilterOptions([...locationOptions, ...cityOptions]);
    }
  }, [entertainments]);

  const handleFilterPress = () => {
    setFilterPopupVisible(true);
  };

  const handleApplyFilters = (selectedOptions: FilterOption[]) => {
    setFilterOptions(selectedOptions);
    setFilterPopupVisible(false);
  };

  // Filtrer les entertainments en fonction de la recherche et des filtres de localisation
  const activeLocationFilters = filterOptions
      .filter(option => option.category === 'location' && option.selected)
      .map(option => option.id);

  const filteredEntertainments = entertainments.filter((ent: Entertainment) => {
    const searchMatch = ent.title.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch =
        activeLocationFilters.length === 0 || activeLocationFilters.includes(ent.location);
    return searchMatch && locationMatch;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="Entertainment" />
      </View>
      <View style={styles.content}>
        <SearchBar
            placeholder="Search entertainments..."
            onChangeText={handleSearch}
            value={searchQuery}
            onFilterPress={handleFilterPress}
        />
        <View style={styles.filterContainer}>
          <FilterSelector
            options={cityFilterOptions}
            selectedOptionId={selectedCityId}
            onSelectOption={handleSelectCity}
            title="Filter by City"
          />
        </View>
        <EntertainmentListContainerVo entertainments={filteredEntertainments} />
      </View>

      {/* Intégration du FilterPopup */}
      <FilterPopup
          visible={filterPopupVisible}
          onClose={() => setFilterPopupVisible(false)}
          filterOptions={filterOptions}
          onApplyFilters={handleApplyFilters}
          title="Filtrer les entertainments"
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  filterContainer: {
    marginBottom: 8,
  },
});

export default EntertainmentScreenVo;
