import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../translations/i18n';


interface SearchBarContainerProps {
  onTourPress?: () => void;
  showTour?: boolean;
}

const SearchBarContainer: React.FC<SearchBarContainerProps> = ({
  onTourPress,
  showTour = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Use language context to trigger re-renders
  const { currentLanguage } = useLanguage();

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
        <View style={styles.searchTextContainer}>
          <Text style={styles.searchTitle}>{i18n.t('common.whereTo')}</Text>
          <TextInput
            style={styles.searchSubtitle} 
            placeholder={i18n.t('common.searchPlaceholder')} 
            placeholderTextColor="#888"
            value={searchQuery} 
            onChangeText={setSearchQuery}
          />
        </View>
        
        {showTour && onTourPress && (
          <TouchableOpacity style={styles.tourButton} onPress={onTourPress}>
            <Ionicons name="information-circle-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>
      <LanguageSelector />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 36,
    // marginBottom: 15,
  },
  searchBar: {
    flex: 1,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchTextContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchSubtitle: {
    fontSize: 12,
    color: '#888',
    padding: 0,
    margin: 0,
    height: 20,
  },
  tourButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SearchBarContainer;