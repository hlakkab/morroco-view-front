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
  selectedCity: string;
  searchQuery: string;
  pickupDirection: 'a2h' | 'h2a'; // 'a2h' for airport to hotel, 'h2a' for hotel to airport
}

export interface HotelPickupDetailsState {
  currentPickup: HotelPickupDetails | null;
  loading: boolean;
  error: string | null;
  bookingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  bookingError: string | null;
} 