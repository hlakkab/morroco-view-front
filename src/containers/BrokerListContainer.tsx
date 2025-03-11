import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CardItem from '../components/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../navigation/AppNavigator';

export interface Broker {
  id: string;
  name: string;
  imageUrl?: string;
  location: string;
  rating?: number;
  isFeatured?: boolean;
  isSaved?: boolean;
}

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
  const [savedBrokers, setSavedBrokers] = useState<Record<string, boolean>>({});
  const [filteredBrokers, setFilteredBrokers] = useState<Broker[]>(brokers);
  
  // Filter brokers based on selected location
  React.useEffect(() => {
    if (selectedLocation === 'All Locations') {
      setFilteredBrokers(brokers);
    } else {
      setFilteredBrokers(brokers.filter(broker => {
        // Extract city from location (before the comma)
        const brokerCity = broker.location.split(',')[0].trim();
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
    // For now, just log the broker info
    console.log('Broker selected:', broker);
    // In the future, you can navigate to a broker detail screen
    // navigation.navigate('BrokerDetail', { id: broker.id });
  };

  const handleSaveBroker = (id: string) => {
    setSavedBrokers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
              imageUrl={item.imageUrl}
              title={item.name}
              subtitle={item.location}
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
              actionIcon={<Ionicons name={savedBrokers[item.id] ? "bookmark" : "bookmark-outline"} size={20} color={savedBrokers[item.id] ? "#666" : "#000"} />}
              onActionPress={() => handleSaveBroker(item.id)}
              onCardPress={() => handleBrokerPress(item)}
              containerStyle={styles.cardContainer}
              svgImage={!item.imageUrl ? <Ionicons name="cash-outline" size={32} color="#fff" /> : undefined}
              isSaved={savedBrokers[item.id]}
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