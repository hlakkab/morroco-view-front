import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSelector } from 'react-redux';
import ScreenHeader from '../components/ScreenHeader';
import { RootState } from '../store/store';
import { RootStackParamList } from '../types/navigation';

// Morocco cities coordinates
const CITY_COORDINATES = {
  'Marrakech': { latitude: 31.628674, longitude: -7.992047 },
  'Casablanca': { latitude: 33.589886, longitude: -7.603869 },
  'Rabat': { latitude: 34.020882, longitude: -6.841650 },
  'Agadir': { latitude: 30.427755, longitude: -9.598107 },
};

// Function to get precise coordinates based on title or use city coordinates as fallback
const getItemCoordinates = (item: any): {latitude: number, longitude: number} => {
  // If item already has coordinates, use them
  if (item.coordinate) {
    return item.coordinate;
  }
  
  // Fallback to city coordinates
  if (item.city && CITY_COORDINATES[item.city as keyof typeof CITY_COORDINATES]) {
    return CITY_COORDINATES[item.city as keyof typeof CITY_COORDINATES];
  }
  
  // Default to Marrakech center if nothing else found
  return { latitude: 31.628674, longitude: -7.992047 };
};

const calculateCenter = (spots: Array<any>) => {
  if (!spots || spots.length === 0) {
    // If no spots are provided, return the city center based on selectedCity
    return CITY_COORDINATES['Marrakech']; // Default to Marrakech if no city is selected
  }
  
  // Extract coordinates from all spots
  const validCoordinates = spots
    .filter(spot => {
      const coords = getItemCoordinates(spot);
      return coords && !isNaN(coords.latitude) && !isNaN(coords.longitude);
    })
    .map(spot => getItemCoordinates(spot));
  
  // If no valid coordinates, use city coordinates
  if (validCoordinates.length === 0) {
    return CITY_COORDINATES['Marrakech']; // Default fallback
  }
  
  // Calculate the bounding box of all coordinates
  const latitudes = validCoordinates.map(coord => coord.latitude);
  const longitudes = validCoordinates.map(coord => coord.longitude);
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  // Return the center point of the bounding box
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2
  };
};

// Calculate appropriate zoom level based on the spread of coordinates
const calculateZoomLevel = (coordinates: Array<{latitude: number, longitude: number}>) => {
  if (!coordinates || coordinates.length < 2) {
    return { latitudeDelta: 0.05, longitudeDelta: 0.05 }; // Default zoom for a single point
  }
  
  // Calculate the bounding box
  const latitudes = coordinates.map(coord => coord.latitude);
  const longitudes = coordinates.map(coord => coord.longitude);
  
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  
  // Calculate deltas with padding
  let latDelta = (maxLat - minLat) * 1.5; // Add 50% padding
  let lngDelta = (maxLng - minLng) * 1.5;
  
  // Ensure minimum zoom level for visibility
  latDelta = Math.max(latDelta, 0.02);
  lngDelta = Math.max(lngDelta, 0.02);
  
  // Ensure maximum zoom level to prevent zooming out too far
  latDelta = Math.min(latDelta, 0.5);
  lngDelta = Math.min(lngDelta, 0.5);
  
  return { latitudeDelta: latDelta, longitudeDelta: lngDelta };
};

const TourMapScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TourMapScreen'>>();
  const { tourItems } = route.params || { tourItems: [] };
  
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [displayItems, setDisplayItems] = useState<Array<any>>(tourItems);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  
  // Reference to the map
  const mapRef = React.useRef<MapView>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBjsTQBGvot-ZEot5FG3o7S1Onjm_4woYY';

  useEffect(() => {
    if (!tourItems || tourItems.length === 0) {
      // Show alert when there are no tours
      alert('No tour items available');
      navigation.goBack();
      return;
    }
    
    // Extract unique cities from tour items
    const cities = [...new Set(tourItems.map(item => item.city))];
    setFilteredCities(cities);
    
    // Set initial city if available
    if (cities.length > 0) {
      const firstCity = cities[0];
      setSelectedCity(firstCity);
      
      // Set display items for first city
      const cityItems = tourItems.filter(item => item.city === firstCity);
      setDisplayItems(cityItems);
      
      // Calculate appropriate zoom level for first city
      const validCoordinates = cityItems
        .filter(item => item.coordinate !== undefined)
        .map(item => getItemCoordinates(item));
      
      // If map reference is already available, animate to the city
      if (mapRef.current && validCoordinates.length > 0) {
        const cityCenter = calculateCenter(cityItems);
        const zoomLevel = calculateZoomLevel(validCoordinates);
        
        mapRef.current.animateToRegion({
          latitude: cityCenter.latitude,
          longitude: cityCenter.longitude,
          latitudeDelta: zoomLevel.latitudeDelta,
          longitudeDelta: zoomLevel.longitudeDelta,
        }, 500);
      }
    }
  }, [tourItems, navigation]);

  useEffect(() => {
    // Update displayed items based on selected city
    if (selectedCity) {
      const cityItems = tourItems.filter(item => item.city === selectedCity);
      setDisplayItems(cityItems);
    }
  }, [selectedCity, tourItems]);

  useEffect(() => {
    if (displayItems.length < 2) return; // Need at least 2 points for a route

    const fetchRoutes = async () => {
      const newRoutes = [];
      for (let i = 0; i < displayItems.length - 1; i++) {
        const origin = `${getItemCoordinates(displayItems[i]).latitude},${getItemCoordinates(displayItems[i]).longitude}`;
        const destination = `${getItemCoordinates(displayItems[i + 1]).latitude},${getItemCoordinates(displayItems[i + 1]).longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json`
          + `?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

        try {
          const response = await axios.get(url);
          if (response.data.routes.length > 0) {
            const points = response.data.routes[0].overview_polyline.points;
            newRoutes.push(decodePolyline(points));
          }
        } catch (error) {
          console.error("Error fetching route", error);
        }
      }
      setRoutes(newRoutes);
    };
    fetchRoutes();
  }, [displayItems]);

  const decodePolyline = (encoded: string) => {
    let points = [];
    let index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const handleChangeCity = (direction: 'next' | 'prev') => {
    // Get the list of available cities
    const cities = [...filteredCities];
    const currentIndex = cities.indexOf(selectedCity);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % cities.length;
    } else {
      newIndex = (currentIndex - 1 + cities.length) % cities.length;
    }
    
    const newCity = cities[newIndex];
    setSelectedCity(newCity);
    
    // Center map on the new city
    if (mapRef.current) {
      const cityItems = tourItems.filter(item => item.city === newCity);
      
      // Calculate center of all items in this city
      const cityCenter = calculateCenter(cityItems);
      
      // Calculate appropriate zoom level
      const validCoordinates = cityItems
        .filter(item => item.coordinate !== undefined)
        .map(item => getItemCoordinates(item));
      
      const zoomLevel = calculateZoomLevel(validCoordinates);
      
      // Animate map to new center with appropriate zoom
      mapRef.current.animateToRegion({
        latitude: cityCenter.latitude,
        longitude: cityCenter.longitude,
        latitudeDelta: zoomLevel.latitudeDelta,
        longitudeDelta: zoomLevel.longitudeDelta,
      }, 800);
    }
  };

  const center = calculateCenter(displayItems);
  
  // Calculate initial zoom level based on the spread of items
  const validCoordinates = displayItems
    .filter(item => item.coordinate !== undefined)
    .map(item => getItemCoordinates(item));
    
  const zoomLevel = calculateZoomLevel(validCoordinates);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScreenHeader title={selectedCity ? `${selectedCity} Map` : "Tour Map"} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: center.latitude,
            longitude: center.longitude,
            latitudeDelta: zoomLevel.latitudeDelta,
            longitudeDelta: zoomLevel.longitudeDelta,
          }}
        >
          {displayItems.map((item) => (
            <Marker
              key={item.id}
              coordinate={getItemCoordinates(item)}
              title={item.title}
              description={item.subtitle}
            >
              {item.type && (
                <View style={styles.markerContainer}>
                  <View style={styles.markerIconContainer}>
                    <Ionicons 
                      name={
                        item.type === 'hotel' ? 'bed' : 
                        item.type === 'restaurant' ? 'restaurant' : 
                        item.type === 'match' ? 'football' : 
                        item.type === 'entertainment' ? 'musical-notes' : 'location'
                      } 
                      size={20} 
                      color="#fff" 
                    />
                  </View>
                </View>
              )}
            </Marker>
          ))}

          {/* Draw path between spots */}
          {routes.map((route, index) => (
            <Polyline key={index} coordinates={route} strokeColor="blue" strokeWidth={3} />
          ))}
        </MapView>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleChangeCity('prev')}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.controlText}>{selectedCity}</Text>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleChangeCity('next')}
          >
            <Ionicons name="arrow-forward" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative'
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    borderRadius: 50,
    padding: 10,
  },
  controlButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIconContainer: {
    backgroundColor: '#E53935',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  }
});

export default TourMapScreen; 