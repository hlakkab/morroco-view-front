import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';

const SearchBar = () => {
  return (
    <View style={styles.searchContainer}>
        <Octicons name="search" size={24} color="black" style={styles.icon}/>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by reference, match"
      />
      

    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flex : 1,
    backgroundColor: '#FFFFFF',
    width: 358,
    height: 54,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
   // marginTop: 88,
    //marginLeft: 18,
  },
  icon: {
    marginRight: 10,
    color: '#B4B4B4',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#000000',
    left: 10,
    top: 0.2,
  },
  

  

});

export default SearchBar;


