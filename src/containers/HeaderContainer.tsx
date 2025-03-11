import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';


const HeaderContainer = () => {
  return (
    <View style={styles.container}>
      <BackButton /> 
      <Text style={styles.title}>Africa Cup of Nations</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#FFF7F7',
  },
  title: {
    width: 205,
    height: 26,
    top: 53,
    left: 90,
    fontFamily: 'Raleway', 
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 26,  
    letterSpacing: 0,
    color: '#000000',
  },
});

export default HeaderContainer;

