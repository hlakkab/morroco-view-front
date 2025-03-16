import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CardItem from '../components/cards/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAppDispatch } from '../store/hooks';
import { Broker } from '../types/exchange-broker';



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
    //dispatch(toggleSavedBroker(id));
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
            <CardItem
              imageUrl={'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}
              title={item.name}
              subtitle={item.address}
              tags={[
                {
                  id: 'broker',
                  label: 'BROKER',
                  icon: <Ionicons name="cash-outline" size={12} color="#008060" style={{ marginRight: 4 }} />,
                  style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
                  textStyle: { color: '#008060', fontWeight: '600' }
                },
                ...(item.isFeatured ? [{
                  id: 'partner',
                  label: 'PARTNER',
                  style: { backgroundColor: '#E53935' },
                  textStyle: { color: '#fff' }
                }] : [])
              ]}
              actionIcon={<Ionicons name={item.isSaved ? "bookmark" : "bookmark-outline"} size={20} color={item.isSaved ? "#666" : "#000"} />}
              onActionPress={() => handleSaveBroker(item.id)}
              onCardPress={() => handleBrokerPress(item)}
              containerStyle={styles.cardContainer}
              svgImage={!item.imageUrl ? <Ionicons name="cash-outline" size={32} color="#fff" /> : undefined}
              isSaved={item.isSaved}
            />
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