import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface SearchBarContainerProps {
}

const SearchBarContainer: React.FC<SearchBarContainerProps> = () => {

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#000" style={styles.searchIcon} />
        <View style={styles.searchTextContainer}>
          <Text style={styles.searchTitle}>Where to ?</Text>
          <TextInput
            style={styles.searchSubtitle} placeholder="Events.Monuments.Activities" placeholderTextColor="#888"
            value={searchQuery} onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.filtersButton}>
        <Ionicons name="options-outline" size={22} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 20,
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
  filtersButton: {
    width: 60,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default SearchBarContainer;