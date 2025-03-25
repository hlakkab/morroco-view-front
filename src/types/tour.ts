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
  isEditable: boolean;
} 