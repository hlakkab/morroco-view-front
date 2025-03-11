export interface HotelPickup {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  private: boolean;
  city: string;
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
}

export interface HotelPickupDetailsState {
  currentPickup: HotelPickupDetails | null;
  loading: boolean;
  error: string | null;
} 