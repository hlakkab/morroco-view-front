import React, { useState, useRef } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (longitude: number, latitude: number) => void;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
}) => {
  const mapRef = useRef<MapView | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const handleLocationSelect = (data: any, details: any) => {
    const newLocation = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description,
    };
    
    setSelectedLocation(newLocation);
    
    // Set the initial map region with appropriate deltas for zoom
    const newRegion = {
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      latitudeDelta: 0.01, // Closer zoom for better visibility
      longitudeDelta: 0.01,
    };
    
    setMapRegion(newRegion);
    
    // Animate to the new region
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const handleRegionChange = (region: Region) => {
    setMapRegion(region);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.longitude, selectedLocation.latitude);
      onClose();
    }
  };

  // Zoom in function
  const zoomIn = () => {
    if (mapRef.current && mapRegion) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta / 2,
        longitudeDelta: mapRegion.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  // Zoom out function
  const zoomOut = () => {
    if (mapRef.current && mapRegion) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * 2,
        longitudeDelta: mapRegion.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <GooglePlacesAutocomplete
              placeholder="Search for a location"
              onPress={handleLocationSelect}
              query={{
                key: 'AIzaSyBjsTQBGvot-ZEot5FG3o7S1Onjm_4woYY', // Replace with your API key
                language: 'en',
                components: 'country:ma', // Restrict to Morocco
              }}
              fetchDetails={true}
              onFail={(error) => console.error(error)}
              onNotFound={() => console.log('No results found')}
              onTimeout={() => console.log('timeout')}
              textInputProps={{
                style: styles.searchInput,
                placeholderTextColor: '#999',
              }}
              listViewDisplayed={false}
              enablePoweredByContainer={false}
              styles={{
                container: styles.autocompleteContainer,
                row: styles.autocompleteRow,
                description: styles.autocompleteDescription,
              }}
            />
          </View>

          <View style={styles.mapContainer}>
            {selectedLocation ? (
              <View style={styles.mapWrapper}>
                <MapView
                  ref={mapRef}
                  provider={PROVIDER_DEFAULT}
                  style={styles.map}
                  initialRegion={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  region={mapRegion || undefined}
                  onRegionChangeComplete={handleRegionChange}
                  showsUserLocation={true}
                  showsMyLocationButton={true}
                  showsCompass={true}
                  rotateEnabled={true}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={Platform.OS !== 'ios'} // Disable pitch on iOS to avoid issues
                >
                  <Marker
                    coordinate={{
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                    }}
                    title="Selected Location"
                    description={selectedLocation.address}
                  />
                </MapView>
                
                {/* Zoom controls */}
                <View style={styles.zoomControls}>
                  <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
                    <Ionicons name="add" size={24} color="#333" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
                    <Ionicons name="remove" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map-outline" size={48} color="#ccc" />
                <Text style={styles.mapPlaceholderText}>
                  Search for a location to display on the map
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedLocation && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  autocompleteContainer: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  autocompleteRow: {
    backgroundColor: '#fff',
    padding: 13,
    height: 'auto',
  },
  autocompleteDescription: {
    color: '#333',
  },
  mapContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#999',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 100 : 16, // Position higher on iOS to avoid overlap with system controls
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
  confirmButton: {
    backgroundColor: '#008060',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationPickerModal; 