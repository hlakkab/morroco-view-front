import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import i18n from '../../translations/i18n';

interface MapDisplayProps {
  mapVisible: boolean;
  mapRef: React.RefObject<MapView | null>;
  mapRegion: Region | null;
  destination: [number, number] | null;
  hotelLocation: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({
  mapVisible,
  mapRef,
  mapRegion,
  destination,
  hotelLocation,
  onZoomIn,
  onZoomOut,
}) => {
  if (mapVisible && destination) {
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={mapRegion || undefined}
          showsUserLocation={true}
          showsCompass={true}
          rotateEnabled={true}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={Platform.OS !== 'ios'}
        >
          <Marker
            coordinate={{
              latitude: destination[1],
              longitude: destination[0],
            }}
            title={i18n.t('reservation.selectedLocation')}
            description={hotelLocation}
          />
        </MapView>

        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={onZoomIn}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={onZoomOut}>
            <Ionicons name="remove" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mapPlaceholderContainer}>
      <View style={styles.mapPlaceholderContent}>
        <Ionicons name="map-outline" size={50} color="#CE1126" />
        <Text style={styles.mapPlaceholderText}>
          {i18n.t('reservation.searchToSeeMapLocation') || "Search for a location to see it on the map"}
        </Text>
      </View>
      <View style={styles.mapPlaceholderGrid}>
        <View style={styles.mapPlaceholderGridRow}>
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
          <View style={styles.mapPlaceholderGridItem} />
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
          <View style={styles.mapPlaceholderGridItem} />
        </View>
        <View style={styles.mapPlaceholderGridRow}>
          <View style={styles.mapPlaceholderGridItem} />
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
          <View style={styles.mapPlaceholderGridItem} />
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
        </View>
        <View style={styles.mapPlaceholderGridRow}>
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
          <View style={styles.mapPlaceholderGridItem} />
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemDark]} />
          <View style={styles.mapPlaceholderGridItem} />
        </View>
        <View style={styles.mapPlaceholderGridRow}>
          <View style={styles.mapPlaceholderGridItem} />
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
          <View style={styles.mapPlaceholderGridItem} />
          <View style={[styles.mapPlaceholderGridItem, styles.mapPlaceholderGridItemRed]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  zoomButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapPlaceholderContainer: {
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    width: 200,
  },
  mapPlaceholderGrid: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
    padding: 20,
  },
  mapPlaceholderGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  mapPlaceholderGridItem: {
    flex: 1,
    margin: 2,
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholderGridItemDark: {
    backgroundColor: '#ccc',
  },
  mapPlaceholderGridItemRed: {
    backgroundColor: '#CE1126',
  },
});

