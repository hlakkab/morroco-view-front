import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import CardItem from '../components/cards/CardItem';
import FilterSelector from '../components/FilterSelector';
import { RootStackParamList } from '../types/navigation';

export interface Monument {
  id: string;
  name: string;
  imageUrl?: string;
  location: string;
  rating?: number;
  isFeatured?: boolean;
  isSaved?: boolean;
  visitingHours?: string;
  entryFee?: string;
  website?: string;
  about?: string;
}

interface MonumentsListContainerProps {
  monuments: Monument[];
  locations: string[];
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
}

const MonumentsListContainer: React.FC<MonumentsListContainerProps> = ({
  monuments,
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const [savedMonuments, setSavedMonuments] = useState<Record<string, boolean>>({});
  const [filteredMonuments, setFilteredMonuments] = useState<Monument[]>(monuments);
  
  // Filter monuments based on selected location
  React.useEffect(() => {
    if (selectedLocation === 'All Locations') {
      setFilteredMonuments(monuments);
    } else {
      setFilteredMonuments(monuments.filter(monument => {
        // Extract city from location (before the comma)
        const monumentCity = monument.location.split(',')[0].trim();
        return monumentCity === selectedLocation;
      }));
    }
  }, [selectedLocation, monuments]);

  // Convert locations to filter options format
  const locationOptions = locations.map(location => ({
    id: location,
    label: location,
    icon: <Ionicons name="location-outline" size={16} color={selectedLocation === location ? '#fff' : '#888'} style={{ marginRight: 4 }} />
  }));

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleMonumentPress = (monument: Monument) => {
    // Navigate to monument detail screen
    navigation.navigate('MonumentDetail', {
      id: monument.id,
      name: monument.name,
      imageUrl: monument.imageUrl,
      location: monument.location,
      rating: monument.rating,
      isFeatured: monument.isFeatured,
      visitingHours: monument.visitingHours,
      entryFee: monument.entryFee,
      website: monument.website,
      about: monument.about
    });
  };

  const handleSaveMonument = (id: string) => {
    setSavedMonuments(prev => ({
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
      
      {filteredMonuments.length > 0 ? (
        <FlatList
          data={filteredMonuments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardItem
              imageUrl={item.imageUrl}
              title={item.name}
              subtitle={item.location}
              tags={[
                {
                  id: 'monument',
                  label: 'MONUMENT',
                  icon: <Ionicons name="business-outline" size={12} color="#008060" style={{ marginRight: 4 }} />,
                  style: { backgroundColor: '#E8F5F0', borderWidth: 1, borderColor: '#008060' },
                  textStyle: { color: '#008060', fontWeight: '600' }
                },
                ...(item.isFeatured ? [{
                  id: 'featured',
                  label: 'FEATURED',
                  style: { backgroundColor: '#E53935' },
                  textStyle: { color: '#fff' }
                }] : [])
              ]}
              price={item.entryFee ? {
                value: parseInt(item.entryFee) || 0,
                currency: 'MAD',
                prefix: 'Entry from'
              } : undefined}
              actionIcon={<Ionicons name={savedMonuments[item.id] ? "bookmark" : "bookmark-outline"} size={20} color={savedMonuments[item.id] ? "#666" : "#000"} />}
              onActionPress={() => handleSaveMonument(item.id)}
              onCardPress={() => handleMonumentPress(item)}
              containerStyle={styles.cardContainer}
              svgImage={!item.imageUrl ? <Ionicons name="business" size={32} color="#fff" /> : undefined}
              isSaved={savedMonuments[item.id]}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No monuments found in this location</Text>
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
    backgroundColor: '#FCEBEC',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
  },
  filterSection: {
    flex: 1,
  },
  filterContainer: {
    marginBottom: 0,
  },
  listContent: {
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

export default MonumentsListContainer; 