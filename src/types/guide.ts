export interface Guide {
  id: string;
  name: string;
  images: string[];
  city: string;
  region: string;
  coordinates?: string; // Format: "x,y" from backend
  rating: number;
  reviewCount: number;
  priceFullDay: number; // Total price for full day tour (fixed, regardless of group size)
  priceHalfDay: number; // Total price for half day tour (fixed, regardless of group size)
  maxTouristsPerTour: number; // Maximum number of tourists per tour
  currency: string;
  isFeatured?: boolean;
  saved?: boolean;
  bio: string;
  languages: string[];
  specialties: string[]; // e.g., "history", "adventure", "culture", "food"
  certifications?: string[];
  experienceYears: number;
  phoneNumber?: string;
  email?: string;
  availableDays?: string[]; // Days of the week
  startTime?: string;
  endTime?: string;
  mapId?: string;
}

export interface GuideReview {
  id: string;
  guideId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  tourType?: string;
}

export interface GuideAvailability {
  date: string;
  available: boolean;
  bookedSlots?: number;
  maxSlots?: number;
}

export interface GuideReservation {
  id: string;
  guideId: string;
  userId: string;
  date: string;
  time: string;
  tourType: string;
  numberOfPeople: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  specialRequests?: string;
}

export interface GuideState {
  guides: Guide[];
  loading: boolean;
  error: string | null;
  selectedCity: string;
  searchQuery: string;
  reviews: { [guideId: string]: GuideReview[] };
  availability: { [guideId: string]: GuideAvailability[] };
}

export interface GuideDetailsState {
  currentGuide: Guide | null;
  loading: boolean;
  error: string | null;
  reservationStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  reservationError: string | null;
}

