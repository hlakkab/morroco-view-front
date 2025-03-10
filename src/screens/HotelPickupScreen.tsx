import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import SvgImage from 'react-native-svg/lib/typescript/elements/Image';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import TransportListContainer from '../containers/TransportListContainer';

// Sample data
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
  const [selectedCity, setSelectedCity] = useState('Marrakech');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilter = () => {
    // Implement filter functionality
    console.log('Filter pressed');
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
  };

  // Filter transports based on search query
  const filteredTransports = SAMPLE_TRANSPORTS.filter(transport => 
    transport.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Hotel Pickup" onBack={handleBack} />
      
        <SearchBar 
          placeholder="Search for hotel..."
          onChangeText={handleSearch}
          onFilterPress={handleFilter}
        />
      <View style={styles.content}>
        
        <TransportListContainer 
          transports={filteredTransports}
          cities={CITIES}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
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
});

export default HotelPickupScreen; 