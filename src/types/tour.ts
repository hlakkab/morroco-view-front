import { TourItem } from '../store/tourSlice';

export interface Destination extends TourSavedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  city: string;
  date?: string;

}

export interface Tour {
  id: string;
  title: string;
  imageUrl: string;
  city: string;
  duration: number;
  price?: number;
  startDate: string;
  endDate: string;
  totalDestinations?: number;
  destinations: Destination[] | string[];
  isEditable: boolean;
  destinationCount: number;
  from: string;
  to: string;
  tourItems?: TourItem[];
  selectedItemsByDay?: Record<number, string[]>;
  cities?: Record<number, string>;
}

export interface TourSavedItem {
  id: string;
  type: 'restaurant' | 'monument' | 'money-exchange' | 'match' | 'hotel' | 'entertainment';
  title: string;
  subtitle?: string;
  images?: string[];
  city: string;
  coordinates?: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}