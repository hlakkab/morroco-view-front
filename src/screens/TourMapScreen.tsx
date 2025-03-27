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

// Predefined colors for routes
const ROUTE_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEEAD', // Cream Yellow
  '#D4A5A5', // Dusty Rose
  '#9B59B6', // Purple
  '#3498DB', // Blue
  '#E67E22', // Orange
  '#2ECC71', // Green
];

// Function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to get a color for a route
const getRouteColor = (index: number): string => {
  const shuffledColors = shuffleArray(ROUTE_COLORS);
  return shuffledColors[index % shuffledColors.length];
};

// Hotels coordinates for each city
const HOTELS_BY_CITY = {
  'Marrakech': {
    title: 'Riad Kbour & Chou',
    coordinate: { latitude: 31.629722, longitude: -7.988889 }
  },
  'Casablanca': {
    title: 'Four Seasons Casablanca',
    coordinate: { latitude: 33.604437, longitude: -7.670120 }
  },
  'Rabat': {
    title: 'Sofitel Rabat Jardin des Roses',
    coordinate: { latitude: 34.015731, longitude: -6.841783 }
  },
  'Agadir': {
    title: 'Sofitel Agadir Royal Bay Resort',
    coordinate: { latitude: 30.413723, longitude: -9.600754 }
  }
};

// Function to get precise coordinates based on title or use city coordinates as fallback
const getItemCoordinates = (item: any): {latitude: number, longitude: number} => {
  // If item already has coordinates in the correct format, use them
  if (item.coordinate && typeof item.coordinate.latitude === 'number' && typeof item.coordinate.longitude === 'number') {
    return item.coordinate;
  }
  
  // If coordinates are in string format, parse them
  if (item.coordinates) {
    const [latitude, longitude] = item.coordinates.split(',').map(Number);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      return { latitude, longitude };
    }
  }
  
  // Check for hotel coordinates
  const cityHotel = Object.values(HOTELS_BY_CITY).find(hotel => hotel.title === item.title);
  if (cityHotel) {
    return cityHotel.coordinate;
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
  
  const [routes, setRoutes] = useState<Array<{points: any[], color: string}>>([]);
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
    }

    // Set initial display items (hotels will be added by the selectedCity useEffect)
    setDisplayItems(tourItems);
  }, [tourItems, navigation]);
  
  // Update displayItems whenever selectedCity changes
  useEffect(() => {
    if (selectedCity && tourItems.length > 0) {
      // Get the hotel for the selected city
      const cityHotel = HOTELS_BY_CITY[selectedCity as keyof typeof HOTELS_BY_CITY];
      const hotelItem = {
        id: `hotel-${selectedCity.toLowerCase()}`,
        title: cityHotel.title,
        city: selectedCity,
        type: 'hotel',
        coordinate: cityHotel.coordinate,
        subtitle: 'Your Hotel'
      };

      // Set display items for selected city, including the hotel
      const cityItems = tourItems.filter(item => item.city === selectedCity);
      // Always put hotel as first item
      const itemsWithHotel = [hotelItem, ...cityItems];
      setDisplayItems(itemsWithHotel);
      
      // Calculate appropriate zoom level for city
      const validCoordinates = itemsWithHotel
        .filter(item => item.coordinate !== undefined)
        .map(item => getItemCoordinates(item));
      
      // If map reference is already available, animate to the city
      if (mapRef.current && validCoordinates.length > 0) {
        const cityCenter = calculateCenter(itemsWithHotel);
        const zoomLevel = calculateZoomLevel(validCoordinates);
        
        mapRef.current.animateToRegion({
          latitude: cityCenter.latitude,
          longitude: cityCenter.longitude,
          latitudeDelta: zoomLevel.latitudeDelta,
          longitudeDelta: zoomLevel.longitudeDelta,
        }, 500);
      }
    }
  }, [selectedCity, tourItems]);

  useEffect(() => {
    if (displayItems.length < 1) return; // Need at least 1 point for a route

    const fetchRoutes = async () => {
      const newRoutes = [];
      // Only get items for the selected city
      const selectedCityItems = displayItems.filter(item => item.city === selectedCity);
      
      // If we have less than 1 item for this city, we can't create routes
      if (selectedCityItems.length < 1) {
        setRoutes([]);
        return;
      }
      
      // Create circular route: hotel -> destinations -> hotel
      const hotel = selectedCityItems.find(item => item.type === 'hotel');
      if (!hotel) return;

      // Generate routes from hotel to each destination and back
      for (let i = 0; i < selectedCityItems.length; i++) {
        const currentItem = selectedCityItems[i];
        const nextItem = selectedCityItems[(i + 1) % selectedCityItems.length];
        
        const origin = `${getItemCoordinates(currentItem).latitude},${getItemCoordinates(currentItem).longitude}`;
        const destination = `${getItemCoordinates(nextItem).latitude},${getItemCoordinates(nextItem).longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json`
          + `?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

        try {
          const response = await axios.get(url);
          if (response.data.routes.length > 0) {
            const points = response.data.routes[0].overview_polyline.points;
            newRoutes.push({
              points: decodePolyline(points),
              color: getRouteColor(i)
            });
          }
        } catch (error) {
          console.error("Error fetching route", error);
          // Add a direct line if route fetching fails
          newRoutes.push({
            points: [
              getItemCoordinates(currentItem),
              getItemCoordinates(nextItem)
            ],
            color: getRouteColor(i)
          });
        }
      }
      setRoutes(newRoutes);
    };

    // Call fetchRoutes immediately
    fetchRoutes();

    // Set up an interval to refresh routes every 5 seconds
    const intervalId = setInterval(fetchRoutes, 5000);

    // Cleanup interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [displayItems, selectedCity]);

  // Update the initial route generation useEffect
  useEffect(() => {
    if (selectedCity && displayItems.length > 0) {
      const selectedCityItems = displayItems.filter(item => item.city === selectedCity);
      if (selectedCityItems.length > 0) {
        const hotel = selectedCityItems.find(item => item.type === 'hotel');
        if (hotel) {
          // Generate initial direct lines between points
          const initialRoutes = [];
          for (let i = 0; i < selectedCityItems.length; i++) {
            const currentItem = selectedCityItems[i];
            const nextItem = selectedCityItems[(i + 1) % selectedCityItems.length];
            initialRoutes.push({
              points: [
                getItemCoordinates(currentItem),
                getItemCoordinates(nextItem)
              ],
              color: getRouteColor(i)
            });
          }
          setRoutes(initialRoutes);
        }
      }
    }
  }, [selectedCity, displayItems]);

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
    // The map will update automatically through the useEffect hook that watches selectedCity
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
        <ScreenHeader title={selectedCity ? `${selectedCity} Tour Map` : "Tour Map"} />
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
          {displayItems.map((item, index) => (
            <Marker
              key={item.id}
              coordinate={getItemCoordinates(item)}
              title={item.title}
              description={item.subtitle}
            >
              {item.type && (
                <View style={styles.markerContainer}>
                  <View style={styles.indexBadge}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                  </View>
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

          {/* Draw path between spots with different colors */}
          {routes.map((route, index) => (
            <Polyline 
              key={index} 
              coordinates={route.points} 
              strokeColor={route.color}
              strokeWidth={5}
              
              geodesic={true}
              zIndex={1}
            />
          ))}
        </MapView>

        {displayItems.length < 2 && (
          <View style={styles.noticeContainer}>
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.noticeText}>Need at least 2 destinations to show routes.</Text>
            </View>
          </View>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => handleChangeCity('prev')}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.cityInfoContainer}>
            <Text style={styles.controlText}>{selectedCity}</Text>
            <Text style={styles.destinationCount}>
              {displayItems.length} destination{displayItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    textAlign: 'center',
  },
  cityInfoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  destinationCount: {
    fontSize: 12,
    color: '#DDD',
    marginTop: 2,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // position: 'relative',
  },
  markerIconContainer: {
    backgroundColor: '#E53935',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    margin: 5,
    borderColor: '#fff',
  },
  indexBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2196F3',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  indexText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noticeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  noticeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TourMapScreen; 