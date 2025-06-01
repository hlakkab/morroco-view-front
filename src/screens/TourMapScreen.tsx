import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSelector } from 'react-redux';
import ScreenHeader from '../components/ScreenHeader';
import { RootState } from '../store/store';
import i18n from '../translations/i18n';
import { RootStackParamList } from '../types/navigation';

// Morocco cities coordinates
const CITY_COORDINATES = {
  'Marrakech': { latitude: 31.628674, longitude: -7.992047 },
  'Casablanca': { latitude: 33.589886, longitude: -7.603869 },
  'Rabat': { latitude: 34.020882, longitude: -6.841650 },
  'Agadir': { latitude: 30.427755, longitude: -9.598107 },
  'Fez': { latitude: 34.0181, longitude: -5.0078 },
};

// Predefined colors for routes
const ROUTE_COLORS = [
  '#1E90FF', // Dodger Blue (Bright)
  '#4169E1', // Royal Blue
  '#0000CD', // Medium Blue
  '#00008B', // Dark Blue
  '#000080', // Navy Blue
  '#191970', // Midnight Blue
  '#1E3D59', // Deep Blue
  '#2C3E50', // Dark Blue-Gray
  '#34495E', // Steel Blue
  '#2B6CB0', // Ocean Blue
];



// Function to get a color for a route
const getRouteColor = (index: number): string => {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
};

// Hotels coordinates for each city
const HOTELS_BY_CITY = {
  'Marrakech': {
    title: 'Riad Kbour & Chou',
    coordinate: { latitude: 31.629722, longitude: -7.988889 }
  },
  'Casablanca': {
    title: 'Four Seasons Casablanca',
    coordinate: { latitude: 33.5996166, longitude: -7.6638331 }
  },
  'Rabat': {
    title: 'Sofitel Rabat Jardin des Roses',
    coordinate: { latitude: 34.015731, longitude: -6.841783 }
  },
  'Agadir': {
    title: 'Sofitel Agadir Royal Bay Resort',
    coordinate: { latitude: 30.413723, longitude: -9.600754 }
  },
  'Fez': {
    title: 'Palais Amani',
    coordinate: { latitude: 34.0633, longitude: -4.9822 }
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

// Add this function before the TourMapScreen component
const getMarkerContent = (item: any, imageError: boolean, onImageError: (itemId: string) => void) => {
  // Check if item has an image and no error loading it
  if (item.image && !imageError) {
    return (
      <Image 
        source={{ uri: item.image }} 
        style={styles.markerImage}
        onError={() => {
          console.log(`Failed to load image for ${item.title}`);
          onImageError(item.id);
        }}
      />
    );
  }
  
  // Otherwise show an icon based on item type
  const iconName = !item.type ? 'location' :
                  item.type === 'hotel' ? 'bed' : 
                  item.type === 'restaurant' ? 'restaurant' : 
                  item.type === 'match' ? 'football' : 
                  item.type === 'entertainment' ? 'musical-notes' : 
                  item.type === 'monument' ? 'business' : 
                  item.type === 'money-exchange' ? 'cash' :
                  item.type === 'artisan' ? 'construct' : 'location';
  
  return <Ionicons name={iconName} size={18} color="#fff" />;
};

const TourMapScreen: React.FC = () => {

  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TourMapScreen'>>();
  const { tourItems, selectedDay: initialSelectedDay = 1 } = route.params || { tourItems: [] };
  
  const [routes, setRoutes] = useState<Array<{points: any[], color: string}>>([]);
  const [selectedDay, setSelectedDay] = useState<number>(initialSelectedDay);
  const [displayItems, setDisplayItems] = useState<Array<any>>([]);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [currentCity, setCurrentCity] = useState<string>('');
  const [mapKey, setMapKey] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<{[key: string]: boolean}>({});
  
  // Reference to the map
  const mapRef = React.useRef<MapView>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyCPr-CMCoPoLZAklHjtnuqgoxXuVD8WEek';

  // Function to get date for a day
  const getDateForDay = (day: number): string => {
    const dayItems = tourItems.filter(item => (item.day || 1) === day);
    if (dayItems.length > 0 && dayItems[0].date) {
      const date = new Date(dayItems[0].date);
      const dayOfMonth = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'long' });
      const year = date.getFullYear();
      return `${dayOfMonth} ${month} ${year}`;
    }
    return `Day ${day}`;
  };

  // Function to fetch routes for a given day
  const fetchRoutesForDay = async (dayItems: Array<any>) => {
    if (dayItems.length < 1) {
      setRoutes([]);
      return;
    }

    setIsLoadingRoutes(true);
    const newRoutes = [];
    
    // Create circular route: hotel -> destinations -> hotel
    const hotel = dayItems.find(item => item.type === 'hotel');
    if (!hotel) {
      setIsLoadingRoutes(false);
      return;
    }

    // Generate routes from hotel to each destination and back
    for (let i = 0; i < dayItems.length; i++) {
      const currentItem = dayItems[i];
      const nextItem = dayItems[(i + 1) % dayItems.length];
      
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
    setMapKey(prev => prev + 1); 
    setIsLoadingRoutes(false);
    console.log('routes fetched ', newRoutes.length);
  };

  // Initialize available days and selected day
  useEffect(() => {
    if (!tourItems || tourItems.length === 0) {
      alert(i18n.t('tours.noTourItemsAvailable'));
      navigation.goBack();
      return;
    }
    
    // Get unique days from tour items
    const days = Array.from(new Set(tourItems.map(item => item.day || 1))).sort((a, b) => a - b);
    setAvailableDays(days);
    
    // Set initial selected day if not already set
    if (days.length > 0 && !initialSelectedDay) {
      setSelectedDay(days[0]);
    }
  }, [tourItems, navigation, initialSelectedDay]);

  // Update display items and fetch routes when selected day changes
  useEffect(() => {
    if (selectedDay && tourItems.length > 0) {
      const dayItems = tourItems.filter(item => (item.day || 1) === selectedDay);
      if (dayItems.length > 0) {
        // Get the city for the current day
        const city = dayItems[0].city;
        setCurrentCity(city);
        
        // Get the hotel for the current city
        const cityHotel = HOTELS_BY_CITY[city as keyof typeof HOTELS_BY_CITY];
        const hotelItem = {
          id: `hotel-${city.toLowerCase()}`,
          title: cityHotel.title,
          city: city,
          type: 'hotel',
          coordinate: cityHotel.coordinate,
          subtitle: i18n.t('tours.yourHotel')
        };

        // Combine hotel with day items
        const itemsWithHotel = [hotelItem, ...dayItems];
        setDisplayItems(itemsWithHotel);
        
        // Fetch routes for the new day
        fetchRoutesForDay(itemsWithHotel);
        
        // Calculate and animate to the new region
        const validCoordinates = itemsWithHotel
          .filter(item => item.coordinate !== undefined)
          .map(item => getItemCoordinates(item));
        
        if (mapRef.current && validCoordinates.length > 0) {
          const dayCenter = calculateCenter(itemsWithHotel);
          const zoomLevel = calculateZoomLevel(validCoordinates);
          
          mapRef.current.animateToRegion({
            latitude: dayCenter.latitude,
            longitude: dayCenter.longitude,
            latitudeDelta: zoomLevel.latitudeDelta,
            longitudeDelta: zoomLevel.longitudeDelta,
          }, 500);
        }
      }
    }
  }, [selectedDay, tourItems]);
  

  const handleChangeDay = (direction: 'next' | 'prev') => {
    const days = [...availableDays];
    const currentIndex = days.indexOf(selectedDay);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % days.length;
    } else {
      newIndex = (currentIndex - 1 + days.length) % days.length;
    }
    
    setSelectedDay(days[newIndex]);
  };

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

  const center = calculateCenter(displayItems);
  
  // Calculate initial zoom level based on the spread of items
  const validCoordinates = displayItems
    .filter(item => item.coordinate !== undefined)
    .map(item => getItemCoordinates(item));
    
  const zoomLevel = calculateZoomLevel(validCoordinates);

  // Function to handle image load errors
  const handleImageError = (itemId: string) => {
    setImageLoadErrors(prev => ({...prev, [itemId]: true}));
  };

  // ############ CONSOLE LOG ############
  //console.log('availableDays', availableDays);
  // ############ CONSOLE LOG ############



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader title={`${currentCity} - ${getDateForDay(selectedDay)}`} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          key={mapKey}
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
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.markerContainer}>
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <View style={styles.markerIconContainer}>
                  {getMarkerContent(item, imageLoadErrors[item.id], handleImageError)}
                </View>
              </View>
            </Marker>
          ))}

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

        {isLoadingRoutes && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1E90FF" />
              <Text style={styles.loadingText}>{i18n.t('tours.loadingRoutes')}</Text>
            </View>
          </View>
        )}

        {displayItems.length < 2 && (
          <View style={styles.noticeContainer}>
            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={24} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.noticeText}>{i18n.t('tours.needAtLeastTwoDestinations')}</Text>
            </View>
          </View>
        )}

        <View style={styles.controlsContainer}>
          {availableDays.length > 1 && (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => handleChangeDay('prev')}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={[
            styles.cityInfoContainer,
            availableDays.length === 1 && styles.singleDayInfo
          ]}>
            <Text style={styles.controlText}>{getDateForDay(selectedDay)}</Text>
            <Text style={styles.destinationCount}>
              {displayItems.length} {i18n.t('tours.destination')}{displayItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {availableDays.length > 1 && (
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => handleChangeDay('next')}
            >
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F7',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
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
    backgroundColor: '#AE1913',
    opacity: 0.9,
    borderRadius: 50,
    padding: 10,
  },
  controlButton: {
    backgroundColor: '#FFF7F7',
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
    position: 'relative',
    width: 36,
    height: 36,
  },
  markerIconContainer: {
    backgroundColor: '#4169E1',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  indexBadge: {
    position: 'absolute',
    top: -0,
    left: 0,
    backgroundColor: '#AE1913',
    width: 16,
    height: 16,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  indexText: {
    color: '#fff',
    fontSize: 10,
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
  singleDayInfo: {
    marginHorizontal: 'auto',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  markerImage: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
  },
});

export default TourMapScreen; 