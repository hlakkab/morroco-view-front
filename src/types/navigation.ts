import { NavigationProp } from "@react-navigation/native";
import { Artisan } from "./Artisan";
import { Event } from "./Event";
import { Monument } from "./Monument";
import { Restaurant } from "./Restaurant";
import { Destination } from "./tour";

export interface SavedItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment' | 'monument' | 'money-exchange' | 'artisan';
  title: string;
  subtitle?: string;
  images?: string[];
  city: string;
  duration?: string;
  timeSlot?: string;
  day?: number;
  date?: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  ESIM: undefined;
  QRCodes: undefined;
  HotelPickup: undefined;
  TransportDetail: {
    id: string;
    title: string;
    imageUrl: string;
    price?: number;
    isPrivate?: boolean;
  };
  BrokerDetail: {
    id: string;
    name: string;
    imageUrl?: string;
    location: string;
    rating?: number;
    isFeatured?: boolean;
    exchangeRates?: {
      buy: number;
      sell: number;
    };
    services?: string[];
    operatingHours?: string;
    contactNumber?: string;
    website?: string;
    about?: string;
    isSaved?: boolean;
  };
  Matches: undefined;
  Monuments: undefined;
  MonumentDetail: Monument;
  Restaurant: undefined;
  RestaurantDetail: Restaurant;
  Entertainment: undefined;
  EntertainmentDetail: {
    productCode: string;
    title: string;
  };
  Events: undefined;
  EventDetail: Event;
  Artisans: undefined;
  ArtisanDetail: Artisan;
  Bookmark: undefined;
  Tickets: undefined;
  Tours: undefined;
  Account: undefined;
  Emergency: undefined;
  MoneyExchange: undefined;
  BrokerList: undefined;
  ExploreMatches: undefined;
  Test: undefined;
  AddNewTour: undefined;
  AddNewTourDestinations: {
    title: string;
    startDate: string;
    endDate: string;
  };
  MarrakechMap: undefined;
  TourMapScreen: {
    tourItems: SavedItem[];
    title?: string;
    singleDayView?: boolean;
    selectedDay?: number;
    totalDays?: number;
    destinationsByDate?: Record<string, Destination[]>;
  };
  AddNewTourOrganize: {
    title?: string;
    startDate?: string;
    endDate?: string;
    selectedItemsByDay?: Record<number, string[]>;
    cities?: Record<number, string>;
    savedItems?: SavedItem[];
    viewMode?: boolean;
  };
};

// Type alias for use with useNavigation hook
export type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;