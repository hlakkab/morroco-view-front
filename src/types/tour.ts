export interface Tour {
  id: string;
  startDate: string;
  title: string;
  imageUrl: string;
  city: string;
  duration: number;
  price: number;
  destinations: TourSavedItem[];
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