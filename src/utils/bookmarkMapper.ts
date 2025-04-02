import { Bookmark } from '../types/bookmark';
import { Monument } from '../types/Monument';
import { Restaurant } from '../types/Restaurant';
import { Match } from '../types/match';
import { Broker } from '../types/exchange-broker';
import { TourSavedItem } from '../types/tour';
import { Entertainment, entertainmentHelpers } from '../types/Entertainment';
// Define the SavedItem type for tours


/**
 * Parses coordinates from string format "x,y" to separate latitude and longitude
 * @param coordinatesStr String in format "latitude,longitude"
 * @returns Object with latitude and longitude as numbers
 */
const parseCoordinates = (coordinatesStr: string): { latitude: number; longitude: number } | undefined => {
  if (!coordinatesStr) return undefined;
  
  const parts = coordinatesStr.split(',');
  if (parts.length !== 2) return undefined;
  
  const latitude = parseFloat(parts[0].trim());
  const longitude = parseFloat(parts[1].trim());
  
  if (isNaN(latitude) || isNaN(longitude)) return undefined;
  
  return { latitude, longitude };
};

/**
 * Capitalizes the first letter of a city name
 * @param city The city name to capitalize
 * @returns The capitalized city name
 */
const capitalizeCity = (city: string): string => {
  if (!city) return '';
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
};

/**
 * Maps a Restaurant object to a TourSavedItem
 */
const mapRestaurantToSavedItem = (restaurant: Restaurant, images?: string[]): TourSavedItem => {
  return {
    id: restaurant.id,
    type: 'restaurant',
    title: restaurant.name,
    subtitle: restaurant.address,
    images: images || restaurant.images,
    city: capitalizeCity(restaurant.city),
    coordinate: parseCoordinates(restaurant.coordinates)
  };
};

/**
 * Maps a Monument object to a TourSavedItem
 */
const mapMonumentToSavedItem = (monument: Monument, images?: string[]): TourSavedItem => {
  return {
    id: monument.id,
    type: 'monument',
    title: monument.name,
    subtitle: monument.address,
    images: images || monument.images,
    city: capitalizeCity(monument.city),
    coordinate: parseCoordinates(monument.coordinates)
  };
};

/**
 * Maps a Broker (money exchange) object to a TourSavedItem
 */
const mapBrokerToSavedItem = (broker: Broker, images?: string[]): TourSavedItem => {
  return {
    id: broker.id,
    type: 'money-exchange',
    title: broker.name,
    subtitle: broker.address,
    images: images || broker.images,
    city: capitalizeCity(broker.city),
    coordinate: parseCoordinates(broker.coordinates)
  };
};

/**
 * Maps a Match object to a TourSavedItem
 */
const mapMatchToSavedItem = (match: Match, images?: string[]): TourSavedItem => {
  return {
    id: match.id,
    type: 'match',
    title: `${match.homeTeam} vs ${match.awayTeam}`,
    subtitle: match.spot.name,
    images: ['https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg'],
    city: capitalizeCity(match.spot.city),
    coordinate: parseCoordinates(match.spot.coordinates)
  };
};

/**
 * Maps an Entertainment object to a TourSavedItem
 */
const mapEntertainmentToSavedItem = (entertainment: any): TourSavedItem => {
  // Parse coordinates if they exist in string format
  let coordinate;
  if (entertainment.coordinates) {
    const [latitude, longitude] = entertainment.coordinates.split(',').map(Number);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      coordinate = { latitude, longitude };
    }
  }

  return {
    id: entertainment.id || entertainment.productCode,
    type: 'entertainment',
    title: entertainment.name,
    subtitle: entertainment.location,
    images: entertainment.images, 
    city: capitalizeCity(entertainment.city),
    coordinate
  };
};

/**
 * Maps an Artisan object to a TourSavedItem
 */
const mapArtisanToSavedItem = (artisan: any): TourSavedItem => {
  return {
    id: artisan.id,
    type: 'artisan',
    title: artisan.name,
    subtitle: artisan.address,
    images: artisan.images,
    city: capitalizeCity(artisan.city),
    coordinate: parseCoordinates(artisan.coordinates)
  };
};

/**
 * Maps a Bookmark to a TourSavedItem based on its type
 * @param bookmark The bookmark to map
 * @returns A TourSavedItem or undefined if the type is not supported
 */
export const mapBookmarkToTourSavedItem = (bookmark: Bookmark): TourSavedItem | undefined => {
  if (!bookmark || !bookmark.object) {
    return undefined;
  }

  switch (bookmark.type.toLowerCase()) {
    case 'restaurant':
      return mapRestaurantToSavedItem(bookmark.object as Restaurant, bookmark.images);
    case 'monument':
      return mapMonumentToSavedItem(bookmark.object as Monument, bookmark.images);
    case 'money_exchange':
    case 'broker':
      return mapBrokerToSavedItem(bookmark.object as Broker, bookmark.images);
    case 'match':
      return mapMatchToSavedItem(bookmark.object as Match, bookmark.images);
    case 'entertainment':
      return mapEntertainmentToSavedItem(bookmark.object as Entertainment);
    case 'artisan':
      return mapArtisanToSavedItem(bookmark.object);
    default:
      console.warn(`Unsupported bookmark type: ${bookmark.type}`);
      return undefined;
  }
};

/**
 * Maps an array of Bookmarks to an array of TourSavedItems
 * @param bookmarks Array of bookmarks to map
 * @returns Array of TourSavedItems (filtered to remove any undefined values)
 */
export const mapBookmarksToTourSavedItems = (bookmarks: Bookmark[]): TourSavedItem[] => {

  return bookmarks
    .map(bookmark => mapBookmarkToTourSavedItem(bookmark))
    .filter((item): item is TourSavedItem => item !== undefined);
}; 