import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';

interface LocationSectionProps {
  address: string;
  mapUrl?: string;
}

const LocationSection: React.FC<LocationSectionProps> = ({ address, mapUrl }) => {
  const handleMapPress = () => {
    if (mapUrl) {
      Linking.openURL(mapUrl).catch(err => {
        console.error("Couldn't open map URL:", err);
      });
    }
  };

  return (
    <View style={styles.locationSection}>
      <Text style={styles.locationTitle}>Location</Text>
      <View style={styles.locationContainer}>
        <TouchableOpacity 
          onPress={handleMapPress}
          disabled={!mapUrl}
          activeOpacity={mapUrl ? 0.7 : 1}
        >
          <Image 
            source={require('../assets/img/map_img.png')} 
            style={[
              styles.mapImage,
              mapUrl ? styles.clickableImage : null
            ]} 
          />
          {mapUrl && (
            <View style={styles.mapIconOverlay}>
              <Text style={styles.mapIconText}>🔗</Text>
            </View>
          )}
        </TouchableOpacity>
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
  clickableImage: {
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  mapIconOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapIconText: {
    fontSize: 12,
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