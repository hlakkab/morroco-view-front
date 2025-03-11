import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import HotelPickupListContainer from '../containers/HotelPickupListContainer';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHotelPickups, setSelectedCity, setSearchQuery } from '../store/hotelPickupSlice';
import { HotelPickup } from '../types/transport';

// Sample data for fallback
const SAMPLE_TRANSPORTS = [
  {
    id: '1',
    imageUrl: '',
    title: 'Marrakech Airport to your hotel',
    price: 100,
    isPrivate: true,
    city: 'Marrakech',
  },
  {
    id: '2',
    imageUrl: '',
    title: 'Marrakech Airport to your hotel',
    price: 100,
    isPrivate: true,
    city: 'Marrakech',
  },
  {
    id: '3',
    imageUrl: '',
    title: 'Marrakech Airport to your hotel',
    price: 100,
    isPrivate: true,
    city: 'Marrakech',
  },
  {
    id: '4',
    imageUrl: '',
    title: 'Rabat Airport to your hotel',
    price: 120,
    isPrivate: true,
    city: 'Rabat',
  },
  {
    id: '5',
    imageUrl: '',
    title: 'Agadir Airport to your hotel',
    price: 90,
    isPrivate: true,
    city: 'Agadir',
  },
];

const CITIES = ['Marrakech', 'Rabat', 'Agadir', 'Casablanca', 'Fes'];

const HotelPickupScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { hotelPickups, selectedCity, searchQuery, loading, error } = useAppSelector(
    (state) => state.hotelPickup
  );

  // Use sample data while testing
  const [useSampleData, setUseSampleData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchHotelPickups()).unwrap();
      } catch (error) {
        console.error('Failed to fetch hotel pickups:', error);
        setUseSampleData(true); // Fallback to sample data if API fails
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    dispatch(setSearchQuery(text));
  };

  const handleFilter = () => {
    // Implement filter functionality
    console.log('Filter pressed');
  };

  const handleSelectCity = (city: string) => {
    dispatch(setSelectedCity(city));
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
      <ScreenHeader title="Hotel Pickup" onBack={handleBack} />
      
      <SearchBar 
        placeholder="Search for hotel..."
        onChangeText={handleSearch}
        onFilterPress={handleFilter}
        value={searchQuery}
      />
      <View style={styles.content}>
        <HotelPickupListContainer 
          pickups={hotelPickups}
          cities={CITIES}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          isLoading={loading}
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