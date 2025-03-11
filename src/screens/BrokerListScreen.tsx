import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import SearchBar from '../components/SearchBar';
import BrokerListContainer, { Broker } from '../containers/BrokerListContainer';

// Sample data for brokers
const SAMPLE_BROKERS: Broker[] = [
  {
    id: '1',
    name: 'Global Exchange',
    location: 'Marrakech, Menara Airport',
    rating: 4.8,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '2',
    name: 'Currency Express',
    location: 'Casablanca, Mohammed V Airport',
    rating: 4.5,
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'

  },
  {
    id: '3',
    name: 'Money Transfer Center',
    location: 'Rabat, Hay Riad District',
    rating: 4.2,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'

  },
  {
    id: '4',
    name: 'Fast Exchange',
    location: 'Marrakech, Gueliz District',
    rating: 4.0,
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },

];

// Declare the list of cities
const CITIES = ['Marrakech', 'Rabat', 'Agadir', 'Casablanca', 'Fes', 'Tanger'];

// Update the ALL_LOCATIONS to use the CITIES array
const ALL_LOCATIONS = ['All Locations', ...CITIES];

const BrokerListScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(ALL_LOCATIONS[0]);
  const [filteredBrokers, setFilteredBrokers] = useState<Broker[]>(SAMPLE_BROKERS);

  // Filter brokers based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBrokers(SAMPLE_BROKERS);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredBrokers(
        SAMPLE_BROKERS.filter(broker => 
          broker.name.toLowerCase().includes(lowercaseQuery) || 
          broker.location.toLowerCase().includes(lowercaseQuery)
        )
      );
    }
  }, [searchQuery]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Money Exchange Brokers" onBack={handleBack} />
      
      <View style={styles.content}>
        <SearchBar 
          placeholder="Search for brokers..." 
          onChangeText={handleSearch} 
        />
        
        <BrokerListContainer 
          brokers={filteredBrokers}
          locations={ALL_LOCATIONS}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
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
    paddingTop: 16,
  },
});

export default BrokerListScreen; 