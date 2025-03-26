import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/cards/CardItem';
import PickupCard from '../components/cards/PickupCard';
import FilterSelector from '../components/FilterSelector';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleHotelPickupBookmark } from '../store/hotelPickupSlice';
import { RootStackParamList } from '../types/navigation';
import { HotelPickup } from '../types/transport';

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
        <View style={styles.filterFromSection}>
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

        {/* <View style={styles.filterDivider} /> */}
        
        <TouchableOpacity 
          style={styles.swapButton}
          // onPress={() => {
          //   const tempCity = selectedAirport;
          //   setSelectedAirport(_ => {
          //     onSelectCity(selectedCity, 'from');
          //     return selectedCity;
          //   });
          //   setSelectedCity(_ => {
          //     onSelectCity(tempCity, 'to');
          //     return tempCity;
          //   });
          // }}
        >
          <View style={styles.swapButtonInner}>
            <Ionicons name="swap-vertical" size={20} color="#CE1126" />
          </View>
        </TouchableOpacity>

        <View style={styles.filterToSection}>
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

      {pickups.length === 0 ? (
        <View style={styles.noPickupsContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.noPickupsText}>
            No pickups available for the selected filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={pickups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PickupCard
              item={item}
              handleSavePickup={handleSavePickup}
              handleCardPress={handleCardPress}
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
    // backgroundColor: '#FCEBEC',
    // borderRadius: 12,
    // padding: 8,
    marginBottom: 16,
  },
  filterFromSection: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filterToSection: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  filterContainer: {
    paddingVertical: 8,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },
  swapButton: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  swapButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#666',
  },
  noPickupsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  noPickupsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 150,
  },
});

export default HotelPickupListContainer; 