import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../translations/i18n';

interface LocationSectionProps {
  address: string;
  mapUrl?: string;
  title?: string;
}

const LocationSection: React.FC<LocationSectionProps> = ({ address, mapUrl, title = i18n.t('restaurants.location') }) => {
  const handleMapPress = () => {
    if (mapUrl) {
      Linking.openURL(mapUrl).catch(err => {
        console.error("Couldn't open map URL:", err);
      });
    }
  };

  return (
    <View style={styles.locationSection}>
      <Text style={styles.locationTitle}>{title}</Text>
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
   // marginTop: 20,
   // marginLeft: 6,
    flex: 1,
    gap: 10,
    marginBottom: 10,
  },

  locationTitle: {
    fontFamily: 'Raleway',
    fontWeight: '700',
    fontSize: 24,
    color: '#000000',
  },
  locationContainer: {
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
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default LocationSection;