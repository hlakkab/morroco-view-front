import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HotelPickupSvg from '../assets/serviceIcons/car-img.svg';
import CardItem from '../components/cards/CardItem';
import PickupCard from '../components/cards/PickupCard';
import FilterSelector from '../components/FilterSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSelectedCity, toggleHotelPickupBookmark, togglePickupDirection } from '../store/hotelPickupSlice';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';
import { HotelPickup } from '../types/transport';

interface HotelPickupListContainerProps {
  pickups: HotelPickup[];
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  isLoading: boolean;
}


const HotelPickupListContainer: React.FC<HotelPickupListContainerProps> = ({
  pickups,
  cities,
  selectedCity,
  onSelectCity, 
  isLoading,
}) => {
  const [selectedCityState, setSelectedCityState] = useState(selectedCity);
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector(state => state.bookmark.bookmarks);
  const { currentLanguage } = useLanguage();

  const handleSavePickup = (pickup: HotelPickup) => {
    dispatch(toggleHotelPickupBookmark(pickup));
  };

  const orderedCities = [selectedCity, ...cities.filter(city => city !== selectedCity)];

  const pickupDirection = useAppSelector(state => state.hotelPickup.pickupDirection);

  

  // Convert cities to filter options format
  const cityOptions = orderedCities.map(city => ({
    id: city,
    label: city,
    icon: <Ionicons name={"location-outline"} size={16} color={selectedCity === city ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleToggleDirection = () => {
    console.log('Toggling direction from screen');
    dispatch(togglePickupDirection());
  };

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
            title={i18n.t('pickup.city')} 
            options={cityOptions}
            selectedOptionId={selectedCity}
            onSelectOption={(option) => {
              setSelectedCityState(_ => {
                onSelectCity(option)
                return option
              })
            }}
            containerStyle={styles.filterContainer}
          />
        </View>

        {/* <View style={styles.filterDivider} /> */}
        
        <View style={styles.directionContainer}>
          <View style={styles.directionControlsWrapper}>
            <View style={styles.directionControls}>
              {pickupDirection === 'a2h' ? (
                // Airport to Hotel layout
                <>
                  <View style={styles.endpointWithLabel}>
                    <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                      <Ionicons name="airplane" size={20} color="#CE1126" />
                    </View>
                    <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                  </View>
                  
                  <View style={styles.directionMiddle}>
                    <TouchableOpacity 
                      style={styles.switchButton}
                      onPress={handleToggleDirection}
                    >
                      <Ionicons name="arrow-forward" size={16} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                  </View>
                  
                  <View style={styles.endpointWithLabel}>
                    <View style={styles.directionEndpoint}>
                      <Ionicons name="home" size={20} color="#777" />
                    </View>
                    <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                  </View>
                </>
              ) : (
                // Hotel to Airport layout
                <>
                  <View style={styles.endpointWithLabel}>
                    <View style={[styles.directionEndpoint, styles.activeEndpoint]}>
                      <Ionicons name="home" size={20} color="#CE1126" />
                    </View>
                    <Text style={styles.endpointLabel}>{i18n.t('pickup.hotel')}</Text>
                  </View>
                  
                  <View style={styles.directionMiddle}>
                    <TouchableOpacity 
                      style={styles.switchButton}
                      onPress={handleToggleDirection}
                    >
                      <Ionicons name="arrow-forward" size={16} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.toLabel}>{i18n.t('pickup.toDirection')}</Text>
                  </View>
                  
                  <View style={styles.endpointWithLabel}>
                    <View style={styles.directionEndpoint}>
                      <Ionicons name="airplane" size={20} color="#777" />
                    </View>
                    <Text style={styles.endpointLabel}>{i18n.t('pickup.airport')}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

      </View>

      <Text style={styles.sectionTitle}>{i18n.t('pickup.availablePickups')}</Text>

      {pickups.length === 0 ? (
        <View style={styles.noPickupsContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.noPickupsText}>
            {i18n.t('pickup.noPickupsAvailable')}
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
  directionContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  directionControlsWrapper: {
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
  },
  directionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endpointWithLabel: {
    alignItems: 'center',
    width: 80,
  },
  directionEndpoint: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    marginBottom: 6,
  },
  activeEndpoint: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  directionMiddle: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  switchButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: '#fff',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  endpointLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  toLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default HotelPickupListContainer; 