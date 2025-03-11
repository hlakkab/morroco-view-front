import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../navigation/AppNavigator';
import { HotelPickup } from '../types/transport';

interface HotelPickupListContainerProps {
  pickups: HotelPickup[];
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isLoading: boolean;
}

const AIRPORTS = ['Marrakech Airport', 'Rabat Airport', 'Agadir Airport', 'Casablanca Airport', 'Fes Airport'];

const HotelPickupListContainer: React.FC<HotelPickupListContainerProps> = ({
  pickups,
  cities,
  selectedCity,
  onSelectCity,
  isLoading,
}) => {
  const [savedPickups, setSavedPickups] = useState<string[]>([]);
  const [selectedAirport, setSelectedAirport] = useState(AIRPORTS[0]);

  const filteredPickups = pickups;

  const handleSavePickup = (id: string) => {
    setSavedPickups(prev => 
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

  const handleCardPress = (item: HotelPickup) => {
    navigation.navigate('TransportDetail', {
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl || '',
      price: item.price,
      isPrivate: item.private,
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
      
      <Text style={styles.sectionTitle}>Available pickups</Text>
      
      {filteredPickups.length === 0 ? (
        <Text style={styles.noPickupsText}>
          No pickups available from {selectedAirport} to {selectedCity}
        </Text>
      ) : (
        <FlatList
          data={filteredPickups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardItem
              imageUrl={item.imageUrl}
              title={item.title}
              price={{
                value: item.price,
                suffix: 'per group'
              }}
              tags={[
                {
                  id: 'pickup',
                  label: 'Pickup',
                  icon: <Ionicons name="car-outline" size={14} color="#008060" style={{ marginRight: 4 }} />,
                  textStyle: { color: '#008060', fontWeight: '500' }
                },
                {
                  id: 'type',
                  label: item.private ? 'Private Pickup' : 'Shared Pickup',
                  textStyle: { color: '#888' }
                }
              ]}
              actionIcon={
                <Ionicons 
                  name={savedPickups.includes(item.id) ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={savedPickups.includes(item.id) ? "#666" : "#000"} 
                />
              }
              isSaved={savedPickups.includes(item.id)}
              onActionPress={() => handleSavePickup(item.id)}
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
  noPickupsText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#888',
  },
});

export default HotelPickupListContainer; 