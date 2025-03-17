import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CardItem from '../components/cards/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppDispatch } from '../store/hooks';
import { Broker } from '../types/exchange-broker';
import BrokerCard from '../components/cards/BrokerCard';
import { toggleBrokerBookmark } from '../store/exchangeBrokerSlice';



interface BrokerListContainerProps {
  brokers: Broker[];
  locations: string[];
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
}

const BrokerListContainer: React.FC<BrokerListContainerProps> = ({
  brokers,
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const dispatch = useAppDispatch();
  const [filteredBrokers, setFilteredBrokers] = useState<Broker[]>(brokers);
  
  // Filter brokers based on selected location
  useEffect(() => {
    if (selectedLocation === 'All Locations') {
      setFilteredBrokers(brokers);
    } else {
      setFilteredBrokers(brokers.filter(broker => {
        // Extract city from location (before the comma)
        const brokerCity = broker.city
        return brokerCity === selectedLocation;
      }));
    }
  }, [selectedLocation, brokers]);

  // Convert locations to filter options format
  const locationOptions = locations.map(location => ({
    id: location,
    label: location,
    icon: <Ionicons name="location-outline" size={16} color={selectedLocation === location ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleBrokerPress = (broker: Broker) => {
    // Navigate to broker detail screen
    navigation.navigate('BrokerDetail', broker);
  };

  const handleSaveBroker = (id: string) => {
    const broker = brokers.find(b => b.id === id);
    if (broker) {
      dispatch(toggleBrokerBookmark(broker));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <FilterSelector
            title="Location:"
            options={locationOptions}
            selectedOptionId={selectedLocation}
            onSelectOption={onSelectLocation}
            containerStyle={styles.filterContainer}
          />
        </View>
      </View>
      
      {filteredBrokers.length > 0 ? (
        <FlatList
          data={filteredBrokers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BrokerCard item={item} handleSaveBroker={handleSaveBroker} handleBrokerPress={handleBrokerPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No brokers found in this location</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterSection: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default BrokerListContainer; 