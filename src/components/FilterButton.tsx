import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';



const FilterButton = ({ onPress }: { onPress: () => void }) => {
    return (
      <TouchableOpacity style={styles.filterButton} onPress={onPress}>
        <Feather name="filter" size={24} color="black" />
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    filterButton: {
        width: 41,
        height: 41,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1.8, // Ajout de la bordure
        borderColor: '#D3D3D3', // Couleur de la bordure grise
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
      },
  });
  
  export default FilterButton;