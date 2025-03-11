import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface LocationSectionProps {
  address: string;
}

const LocationSection: React.FC<LocationSectionProps> = ({ address }) => {
  return (
    <View style={styles.locationSection}>
      <Text style={styles.locationTitle}>Location</Text>
      <View style={styles.locationContainer}>
        <Image 
          source={require('../assets/img/map_img.png')} 
          style={styles.mapImage} 
        />
        <Text style={styles.addressText}>{address}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  locationSection: {
    marginTop: 20,
    marginLeft: 6,
  },
  locationTitle: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 31,
    color: '#000000',
  },
  locationContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  mapImage: {
    width: 169,
    height: 95,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  addressText: {
    top: -25,
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default LocationSection;