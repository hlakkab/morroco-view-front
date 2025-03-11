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
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    services: ['Currency Exchange', 'Travel Money Cards', 'Western Union', 'International Transfers'],
    operatingHours: 'Monday to Sunday: 8:00 AM - 10:00 PM',
    contactNumber: '+212 524 447 500',
    website: 'www.globalexchange.ma',
    about: 'Global Exchange is a leading currency exchange service provider with over 260 branches worldwide. Our Marrakech branch offers competitive rates, no hidden fees, and a wide range of currencies. Our experienced staff provides personalized service to ensure you get the best value for your money. We are open 7 days a week with extended hours to accommodate your travel schedule.'
  },
  {
    id: '2',
    name: 'Currency Express',
    location: 'Casablanca, Mohammed V Airport',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    services: ['Currency Exchange', 'Bank Transfers', 'Credit Cards', "Traveler's Checks"],
    operatingHours: 'Monday to Friday: 9:00 AM - 4:00 PM',
    contactNumber: '+212 522 334 455',
    website: 'www.currencyexpress.ma',
    about: "Currency Express is a trusted name in foreign exchange services across Morocco. Our Casablanca airport branch provides fast and reliable currency exchange with competitive rates. We offer a wide range of services to meet all your financial needs while traveling."
  },
  {
    id: '3',
    name: 'Money Transfer Center',
    location: 'Rabat, Hay Riad District',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    services: ['Currency Exchange', 'Money Transfer', 'Bill Payments', 'Mobile Top-up'],
    operatingHours: 'Monday to Saturday: 9:00 AM - 6:00 PM',
    contactNumber: '+212 537 223 344',
    website: 'www.moneytransfer.ma',
    about: "Money Transfer Center provides comprehensive financial services in the heart of Rabat. We specialize in international money transfers and currency exchange with some of the most competitive rates in the city. Our professional staff is dedicated to providing fast and secure service."
  },
  {
    id: '4',
    name: 'Fast Exchange',
    location: 'Marrakech, Gueliz District',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    services: ['Currency Exchange', 'Gold Trading', 'Money Transfer'],
    operatingHours: 'Monday to Sunday: 10:00 AM - 8:00 PM',
    contactNumber: '+212 524 556 677',
    website: 'www.fastexchange.ma',
    about: "Fast Exchange offers quick and reliable currency exchange services in the modern Gueliz district of Marrakech. We pride ourselves on our efficiency and customer service, ensuring you get the best rates with minimal waiting time. Our convenient location makes us accessible to both tourists and locals."
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
        onFilterPress={() => {}}
        value={searchQuery}
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