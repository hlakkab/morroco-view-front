import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import i18n from '../../translations/i18n';

interface LocationSearchInputProps {
  googlePlacesRef: React.RefObject<any>;
  onLocationSelect: (data: any, details: any) => void;
  onClearLocation: () => void;
  selectedCity?: string | null;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number; radius: number }> = {
  marrakech: { lat: 31.6295, lng: -7.9811, radius: 20000 },
  casablanca: { lat: 33.5731, lng: -7.5898, radius: 25000 },
  rabat: { lat: 34.0209, lng: -6.8416, radius: 20000 },
  tangier: { lat: 35.7595, lng: -5.8340, radius: 20000 },
  fes: { lat: 34.0181, lng: -5.0078, radius: 20000 },
  agadir: { lat: 30.4278, lng: -9.5981, radius: 20000 },
  essaouira: { lat: 31.5085, lng: -9.7595, radius: 15000 },
  ouarzazate: { lat: 30.9189, lng: -6.8930, radius: 15000 },
  meknes: { lat: 33.8897, lng: -5.5473, radius: 15000 },
  chefchaouen: { lat: 35.1710, lng: -5.2697, radius: 12000 },
};

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  googlePlacesRef,
  onLocationSelect,
  onClearLocation,
  selectedCity,
}) => {
  const normalizedCity = selectedCity ? selectedCity.trim() : '';
  const cityCoordinates = normalizedCity
    ? CITY_COORDINATES[normalizedCity.toLowerCase()]
    : undefined;

  return (
    <View style={styles.locationInputContainer}>
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder={i18n.t('reservation.searchForLocation')}
        onPress={onLocationSelect}
        query={{
          key: 'AIzaSyCFn8o4bWB3TQSwwf7f01fXTOzhZsuASy4',
          language: 'en',
          components: 'country:ma',
          ...(cityCoordinates
            ? {
                location: `${cityCoordinates.lat},${cityCoordinates.lng}`,
                radius: cityCoordinates.radius,
                strictbounds: true,
              }
            : {}),
        }}
        fetchDetails={true}
        predefinedPlaces={[]}
        predefinedPlacesAlwaysVisible={false}
        minLength={2}
        timeout={20000}
        onFail={(error) => console.error(error)}
        onNotFound={() => {}}
        styles={{
          container: styles.autocompleteContainer,
          textInputContainer: styles.textInputContainer,
          textInput: styles.searchInput,
          listView: styles.listView,
          row: styles.autocompleteRow,
          description: styles.autocompleteDescription,
          separator: styles.autocompleteSeparator,
          poweredContainer: { display: 'none' }
        }}
        enablePoweredByContainer={false}
        listViewDisplayed={true}
        textInputProps={{
          placeholderTextColor: '#999',
          returnKeyType: 'search',
          clearButtonMode: 'while-editing',
          onChangeText: (text: string) => {
            if (text === '') onClearLocation();
          }
        }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  locationInputContainer: {
    marginBottom: 8,
    height: 40,
    zIndex: 5,
    position: 'relative',
  },
  autocompleteContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  textInputContainer: {
    width: '100%',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  listView: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    maxHeight: 210,
    zIndex: 15,
    elevation: 5,
  },
  autocompleteRow: {
    backgroundColor: '#fff',
    padding: 15,
    height: 'auto',
  },
  autocompleteDescription: {
    color: '#333',
    fontSize: 14,
  },
  autocompleteSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});

