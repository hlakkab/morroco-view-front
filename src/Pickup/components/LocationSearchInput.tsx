import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import i18n from '../../translations/i18n';

interface LocationSearchInputProps {
  googlePlacesRef: React.RefObject<any>;
  onLocationSelect: (data: any, details: any) => void;
  onClearLocation: () => void;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  googlePlacesRef,
  onLocationSelect,
  onClearLocation,
}) => {
  return (
    <View style={styles.locationInputContainer}>
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder={i18n.t('reservation.searchForLocation')}
        onPress={onLocationSelect}
        query={{
          key: 'AIzaSyBjsTQBGvot-ZEot5FG3o7S1Onjm_4woYY',
          language: 'en',
          components: 'country:ma',
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

