export interface HotelPickup {
  id: string;
  images: string[];
  title: string;
  price: number;
  private: boolean;
  city: string;
  saved: boolean;
}

export interface HotelPickupDetails extends HotelPickup {
  images: string[];
  nbSeats: number;
  bagCapacity: number;
  nbDoors: number;
  airConditioning: boolean;
  estimatedTime: string;
  about: string;
}

export interface HotelPickupState {
  hotelPickups: HotelPickup[];
  loading: boolean;
  error: string | null;
  selectedFromCity: string;
  selectedToCity: string;
  searchQuery: string;
}

export interface HotelPickupDetailsState {
  currentPickup: HotelPickupDetails | null;
  loading: boolean;
  error: string | null;
  bookingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  bookingError: string | null;
} 