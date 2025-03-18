import React, { useState } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const handleLocationSelect = (data: any, details: any) => {
    setSelectedLocation({
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      address: data.description,
    });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.address);
      onClose();
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
              <MapView
                provider="google"

                style={styles.map}
                camera={{
                  zoom: 13.5,
                  center: {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  },
                  heading: 0,
                  pitch: 0,
                }}

                initialRegion={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
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