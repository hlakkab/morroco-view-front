import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ArtisanCard from '../components/cards/ArtisanCard';
import FilterSelector from '../components/FilterSelector';
import { setSelectedArtisan, toggleArtisanBookmark } from '../store/artisanSlice';
import { useAppDispatch } from '../store/hooks';
import { Artisan, ArtisanType } from '../types/Artisan';
import { RootStackParamList } from '../types/navigation';

interface ArtisanListContainerProps {
  artisans: Artisan[];
  selectedType: ArtisanType | 'All Types';
  onSelectType: (type: ArtisanType | 'All Types') => void;
  showTypeFilter?: boolean;
}

const ArtisanListContainer: React.FC<ArtisanListContainerProps> = ({
  artisans,
  selectedType,
  onSelectType,
  showTypeFilter = true,
}) => {
  const [filteredArtisans, setFilteredArtisans] = useState<Artisan[]>(artisans);
  const dispatch = useAppDispatch();

  // Filter artisans according to the selected type
  useEffect(() => {
    if (selectedType === 'All Types') {
      setFilteredArtisans(artisans);
    } else {
      setFilteredArtisans(artisans.filter(artisan => artisan.type === selectedType));
    }
  }, [selectedType, artisans]);

  // Filter options for artisan types
  const typeOptions = [
    {
      id: 'All Types',
      label: 'All Types',
      icon: <Ionicons name="hand-left-outline" size={16} color="#888" style={{ marginRight: 4 }} />,
    },
    ...Object.values(ArtisanType).map(type => ({
      id: type,
      label: type,
      icon: <Ionicons name="hand-left-outline" size={16} color="#888" style={{ marginRight: 4 }} />,
    })),
  ];

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleArtisanPress = (artisan: Artisan) => {
    dispatch(setSelectedArtisan(artisan));
    navigation.navigate('ArtisanDetail', artisan);
  };

  const handleSaveArtisan = (artisan: Artisan) => {
    dispatch(toggleArtisanBookmark(artisan));
  };

  // Determine the empty state message based on filter conditions
  const getEmptyStateMessage = () => {
    if (artisans.length === 0) {
      return "No artisan souks available";
    } else if (filteredArtisans.length === 0 && selectedType !== 'All Types') {
      return `No artisan souks found with type: ${selectedType}`;
    } else {
      return "No artisan souks found for the selected filters";
    }
  };

  return (
    <View style={styles.container}>
      {showTypeFilter && (
        <View style={styles.filtersContainer}>
          <FilterSelector
            title="Artisan Type:"
            options={typeOptions}
            selectedOptionId={selectedType}
            onSelectOption={(optionId) => onSelectType(optionId as ArtisanType | "All Types")}
          />
        </View>
      )}
      {filteredArtisans.length > 0 ? (
        <FlatList
          data={filteredArtisans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ArtisanCard
              item={item}
              handleSaveArtisan={handleSaveArtisan}
              handleArtisanPress={handleArtisanPress}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>{getEmptyStateMessage()}</Text>
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
    marginBottom: 150,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ArtisanListContainer; 