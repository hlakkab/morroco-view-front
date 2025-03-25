export interface Destination {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  imageUrl?: string;
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
  // destinations: TourSavedItem[];
  isEditable: boolean;
  destinationCount: number;
  from: string;
  to: string;
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