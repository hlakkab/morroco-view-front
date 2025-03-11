import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Transport {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  isPrivate: boolean;
  city: string;
  svgImage?: React.ReactNode;
}

interface TransportListContainerProps {
  transports: Transport[];
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const AIRPORTS = ['Marrakech Airport', 'Rabat Airport', 'Agadir Airport', 'Casablanca Airport', 'Fes Airport'];

const TransportListContainer: React.FC<TransportListContainerProps> = ({
  transports,
  cities,
  selectedCity,
  onSelectCity,
}) => {
  const [savedTransports, setSavedTransports] = useState<string[]>([]);
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS[0]);

  const filteredTransports = transports.filter(
    transport => transport.city === selectedCity
  );

  const handleSaveTransport = (id: string) => {
    setSavedTransports(prev => 
      prev.includes(id) 
        ? prev.filter(savedId => savedId !== id) 
        : [...prev, id]
    );
  };

  // Convert airports to filter options format
  const airportOptions = AIRPORTS.map(airport => ({
    id: airport,
    label: airport,
    icon: <Ionicons name="airplane-outline" size={16} color={selectedAirport === airport ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  // Convert cities to filter options format
  const cityOptions = cities.map(city => ({
    id: city,
    label: city,
    icon: <Ionicons name="location-outline" size={16} color={selectedCity === city ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleCardPress = (item: Transport) => {
    navigation.navigate('TransportDetail',{
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl || '',
        price: item.price,
        isPrivate: item.isPrivate,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <FilterSelector
            title="From :"
            options={airportOptions}
            selectedOptionId={selectedAirport}
            onSelectOption={setSelectedAirport}
            containerStyle={styles.filterContainer}
          />
        </View>
        
        <View style={styles.filterDivider} />
        
        <View style={styles.filterSection}>
          <FilterSelector
            title="To :"
            options={cityOptions}
            selectedOptionId={selectedCity}
            onSelectOption={onSelectCity}
            containerStyle={styles.filterContainer}
          />
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Available transporters</Text>
      
      {filteredTransports.length === 0 ? (
        <Text style={styles.noTransportsText}>
          No transporters available from {selectedAirport} to {selectedCity}
        </Text>
      ) : (
        <FlatList
          data={filteredTransports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardItem
              imageUrl={item.imageUrl}
              svgImage={item.svgImage}
              title={item.title}
              price={{
                value: item.price,
                suffix: 'per group'
              }}
              tags={[
                {
                  id: 'transport',
                  label: 'Transport',
                  icon: <Ionicons name="car-outline" size={14} color="#008060" style={{ marginRight: 4 }} />,
                  textStyle: { color: '#008060', fontWeight: '500' }
                },
                {
                  id: 'type',
                  label: item.isPrivate ? 'Private Transport' : 'Shared Transport',
                  textStyle: { color: '#888' }
                }
              ]}
              actionIcon={
                <Ionicons 
                  name={savedTransports.includes(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={savedTransports.includes(item.id) ? "#666" : "#000"} 
                />
              }
              isSaved={savedTransports.includes(item.id)}
              onActionPress={() => handleSaveTransport(item.id)}
              onCardPress={() => handleCardPress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    color: '#666',
  },
  noTransportsText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#888',
  },
});

export default TransportListContainer; 