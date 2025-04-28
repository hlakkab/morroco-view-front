import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import MonumentCard from '../components/cards/MonumentCard';
import FilterSelector from '../components/FilterSelector';
import { useAppDispatch } from '../store/hooks';
import { setSelectedMonument, toggleMonumentBookmark } from '../store/monumentSlice';
import i18n from '../translations/i18n';
import { Monument, MonumentType } from '../types/Monument';
import { RootStackParamList } from '../types/navigation';

interface MonumentListContainerProps {
  monuments: Monument[];
  selectedType: MonumentType | 'All Types';
  onSelectType: (type: MonumentType | 'All Types') => void;
  showTypeFilter?: boolean;
}

const MonumentListContainer: React.FC<MonumentListContainerProps> = ({
  monuments,
  selectedType,
  onSelectType,
  showTypeFilter = true,
}) => {
  const [filteredMonuments, setFilteredMonuments] = useState<Monument[]>(monuments);
  const dispatch = useAppDispatch();

  // Filter monuments according to the selected type
  useEffect(() => {
    if (selectedType === 'All Types') {
      setFilteredMonuments(monuments);
    } else {
      setFilteredMonuments(monuments.filter(monument => monument.type === selectedType));
    }
  }, [selectedType, monuments]);

  // Filter options for monument types
  const typeOptions = [
    {
      id: 'All Types',
      label: i18n.t('monuments.allTypes'),
      icon: <Ionicons name="business-outline" size={16} color="#888" style={{ marginRight: 4 }} />,
    },
    ...Object.values(MonumentType).map(type => ({
      id: type,
      label: type,
      icon: <Ionicons name="business-outline" size={16} color="#888" style={{ marginRight: 4 }} />,
    })),
  ];

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleMonumentPress = (monument: Monument) => {
    dispatch(setSelectedMonument(monument));
    navigation.navigate('MonumentDetail', monument);
  };

  const handleSaveMonument = (monument: Monument) => {
    dispatch(toggleMonumentBookmark(monument));
  };

  // Determine the empty state message based on filter conditions
  const getEmptyStateMessage = () => {
    if (monuments.length === 0) {
      return i18n.t('monuments.noMonumentsAvailable');
    } else if (filteredMonuments.length === 0 && selectedType !== 'All Types') {
      return `${i18n.t('monuments.noMonumentsType')} ${selectedType}`;
    } else {
      return i18n.t('monuments.noMonumentsFilters');
    }
  };

  return (
    <View style={styles.container}>
      {showTypeFilter && (
        <View style={styles.filtersContainer}>
          <FilterSelector
            title={i18n.t('monuments.monumentType')}
            options={typeOptions}
            selectedOptionId={selectedType}
            onSelectOption={(optionId) => onSelectType(optionId as MonumentType | "All Types")}
          />
        </View>
      )}
      {filteredMonuments.length > 0 ? (
        <FlatList
          data={filteredMonuments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MonumentCard
              item={item}
              handleSaveMonument={handleSaveMonument}
              handleMonumentPress={handleMonumentPress}
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

export default MonumentListContainer; 