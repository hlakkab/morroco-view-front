export interface TourItem extends TourSavedItem {
  day?: number;
  time?: string;
  duration?: string;
}

export interface Destination extends TourSavedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  city: string;

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
  type: 'restaurant' | 'monument' | 'money-exchange' | 'match' | 'hotel' | 'entertainment' | 'artisan';
  title: string;
  subtitle?: string;
  images?: string[];
  city: string;
  coordinates?: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  date?: string;
  duration?: string;
  timeSlot?: string;
}