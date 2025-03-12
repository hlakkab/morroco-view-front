import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../navigation/AppNavigator';
import { HotelPickup } from '../types/transport';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleHotelPickupBookmark } from '../store/hotelPickupSlice';

interface HotelPickupListContainerProps {
  pickups: HotelPickup[];
  cities: string[];
  selectedFromCity: string;
  selectedToCity: string;
  onSelectCity: (city: string, type: 'from' | 'to') => void;
  isLoading: boolean;
}


const HotelPickupListContainer: React.FC<HotelPickupListContainerProps> = ({
  pickups,
  cities,
  selectedFromCity,
  selectedToCity,
  onSelectCity,
  isLoading,
}) => {
  const [selectedAirport, setSelectedAirport] = useState(selectedFromCity);
  const [selectedCity, setSelectedCity] = useState(selectedToCity);
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector(state => state.bookmark.bookmarks);

  const filteredPickups = pickups;

  const handleSavePickup = (pickup: HotelPickup) => {
    dispatch(toggleHotelPickupBookmark(pickup));
  };

  const fromCities = [selectedAirport, ...cities.filter(city => city !== selectedFromCity)];
  const toCities = [selectedCity, ...cities.filter(city => city !== selectedToCity)];

  // Convert airports to filter options format
  const airportOptions = fromCities.map(city => ({
    id: city,
    label: city + ' Airport',
    icon: <Ionicons name="airplane-outline" size={16} color={selectedAirport === city ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  // Convert cities to filter options format
  const cityOptions = toCities.map(city => ({
    id: city,
    label: city,
    icon: <Ionicons name="location-outline" size={16} color={selectedCity === city ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleCardPress = (item: HotelPickup) => {
    navigation.navigate('TransportDetail', {
      id: item.id,
      title: item.title,
      imageUrl: item.images[0] || '',
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
            onSelectOption={(option) => {
              setSelectedAirport(_ => {
                onSelectCity(option, 'from')
                return option
              })
            }}
            containerStyle={styles.filterContainer}
          />
        </View>
        
        <View style={styles.filterDivider} />
        
        <View style={styles.filterSection}>
          <FilterSelector
            title="To :"
            options={cityOptions}
            selectedOptionId={selectedCity}
            onSelectOption={(option) => {
              setSelectedCity(_ => {
                onSelectCity(option, 'to')
                return option
              })
            }}
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
              imageUrl={item.images[0]}
              svgImage={<HotelPickupSvg width={110} height={80} style={{ alignSelf: 'center', marginRight: 10 }} />}
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
                  name={item.saved ? "bookmark" : "bookmark-outline"} 
                  size={20} 
                  color={item.saved ? "#666" : "#000"} 
                />
              }
              isSaved={item.saved}
              onActionPress={() => handleSavePickup(item)}
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