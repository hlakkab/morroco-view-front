// Types/Entertainment.ts

// Types pour les images
export interface ImageVariant {
  url: string;
  width: number;
  height: number;
}

export interface EntertainmentImage {
  isCover: boolean;
  variants: ImageVariant[];
}

// Type pour les avis
export interface Reviews {
  totalReviews: number;
  combinedAverageRating: number;
}

// Type pour le pricing (legacy)
export interface PricingSummary {
  fromPrice: number;
  fromPriceBeforeDiscount?: number;
}

export interface Pricing {
  summary: PricingSummary;
}

// New pricing structure
export type PricingCategory = 'ADULT' | 'CHILD' | 'SENIOR' | 'STUDENT' | 'GROUP' | 'FAMILY';

export interface EntertainmentPricing {
  id: string;
  createdAt: string; // ISO date string
  createdBy: string;
  updatedAt: string; // ISO date string
  updatedBy: string;
  category: PricingCategory;
  price: number;
  duration: number; // in minutes
  unitLabel: string; // e.g., "per person"
}

// Nouveaux types pour le détail
export interface ItineraryDuration {
  fixedDurationInMinutes?: number;
  variableDurationFromMinutes?: number;
  variableDurationToMinutes?: number;
}

export interface Itinerary {
  itineraryType?: string;
  skipTheLine?: boolean;
  privateTour?: boolean;
  duration?: ItineraryDuration;
  itineraryItems?: any[]; // à affiner selon les besoins
}

export interface TravelerPickup {
  allowCustomTravelerPickup: boolean;
  pickupOptionType?: string;
}

export interface Logistics {
  travelerPickup?: TravelerPickup;
  timeZone?: string;
  // Autres champs selon besoin
}

export interface TicketInfo {
  ticketTypes?: string[];
  ticketTypeDescription?: string;
  ticketsPerBooking?: string;
  ticketsPerBookingDescription?: string;
}

export interface LanguageGuide {
  type: string;
  language: string;
  legacyGuide: string;
}

// New types for the API response
export type EntertainmentType = 
  | 'THEME_PARK'
  | 'WATER_PARK'
  | 'ZOO'
  | 'AQUARIUM'
  | 'MUSEUM'
  | 'THEATER'
  | 'CINEMA'
  | 'CONCERT_HALL'
  | 'SPORTS_VENUE'
  | 'NIGHTCLUB'
  | 'CASINO'
  | 'OTHER';

export type SpotType = 'ACTIVITY';

export type City = 
  | 'MARRAKECH'
  | 'CASABLANCA'
  | 'RABAT'
  | 'FES'
  | 'TANGIER'
  | 'AGADIR'
  | 'MEKNES'
  | 'OUJDA'
  | 'KENITRA'
  | 'TETOUAN'
  | 'SAFI'
  | 'ESSAOUIRA';

export type BookingRequired = 'YES' | 'NO' | 'RECOMMENDED';

// Type principal Entertainment (nouvelle structure API)
export interface Entertainment {
  id: string; // UUID
  images: string[]; // Array of image URLs
  saved: boolean;
  code: string;
  name: string;
  description: string;
  type: string;
  spotType: SpotType;
  address: string;
  mapId: string;
  coordinates: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  city: City;
  phoneNumber: string;
  email: string;
  website: string;
  rating: number;
  bookingRequired: BookingRequired;
  ageRestriction?: number;
  pricings: EntertainmentPricing[]; // New pricing structure as array

  // Legacy fields for backwards compatibility
  productCode?: string;
  title?: string;
  location?: string;
  reviews?: Reviews;
  pricing?: Pricing; // Legacy pricing format
  fullStars?: number;
  hasHalfStar?: boolean;
  mapUrl?: string;

  // Champs détaillés (issus du GET /products/{product-code})
  itinerary?: Itinerary;
  logistics?: Logistics;
  ticketInfo?: TicketInfo;
  languageGuides?: LanguageGuide[];
  isPartner?: boolean;
}

// Pageable response structure
export interface Pageable {
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  pageNumber: number;
  pageSize: number;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

// Paginated response
export interface EntertainmentListResponse {
  content: Entertainment[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// Filter parameters
export interface EntertainmentFilters {
  city?: City;
  type?: EntertainmentType;
  minRating?: number;
  maxRating?: number;
  page?: number;
  size?: number;
  sort?: string;
}

// Fonctions utilitaires (helpers)
export const entertainmentHelpers = {
  getPrimaryImageUrl: (entertainment: Entertainment): string => {
    // Check for new API format (array of strings)
    if (Array.isArray(entertainment.images) && entertainment.images.length > 0) {
      if (typeof entertainment.images[0] === 'string') {
        return entertainment.images[0];
      }
    }

    // Legacy format check
    if (!entertainment.images || entertainment.images.length === 0) {
      return 'https://via.placeholder.com/300';
    }

    // Check if it's the old format with image objects
    const firstImage = entertainment.images[0] as any;
    if (firstImage?.variants) {
      const coverImage = (entertainment.images as any[]).find((img: any) => img.isCover);
      const image = coverImage || entertainment.images[0];

      if (!image?.variants?.length) {
        return 'https://via.placeholder.com/300';
      }

      const sortedVariants = [...image.variants].sort((a: any, b: any) =>
        (b.width * b.height) - (a.width * a.height)
      );

      const idealVariant = sortedVariants.find((v: any) =>
        v.width >= 720 && v.width <= 1080
      ) || sortedVariants[0];

      return idealVariant?.url || 'https://via.placeholder.com/300';
    }

    return 'https://via.placeholder.com/300';
  },

  getFormattedPrice: (entertainment: Entertainment): string => {
    // Check new API format with pricings array
    if (entertainment.pricings && entertainment.pricings.length > 0) {
      // Get the lowest price from the pricings array
      const lowestPrice = Math.min(...entertainment.pricings.map(p => p.price));
      return lowestPrice.toFixed(2);
    }

    // Legacy API format
    if (entertainment.pricing?.summary?.fromPrice) {
      return entertainment.pricing.summary.fromPrice.toFixed(2);
    }

    return '';
  },

  // Get pricing by category
  getPricingByCategory: (entertainment: Entertainment, category: PricingCategory): EntertainmentPricing | undefined => {
    return entertainment.pricings?.find(p => p.category === category);
  },

  // Get lowest price
  getLowestPrice: (entertainment: Entertainment): number | null => {
    if (entertainment.pricings && entertainment.pricings.length > 0) {
      return Math.min(...entertainment.pricings.map(p => p.price));
    }
    if (entertainment.pricing?.summary?.fromPrice) {
      return entertainment.pricing.summary.fromPrice;
    }
    return null;
  },

  getRatingInfo: (entertainment: Entertainment) => {
    // New API format - use rating field directly
    if (typeof entertainment.rating === 'number') {
      const rating = entertainment.rating;
      return {
        rating,
        ratingCount: 0, // Not available in new API
        fullStars: Math.floor(rating),
        hasHalfStar: (rating % 1) >= 0.5
      };
    }

    // Legacy format
    if (!entertainment.reviews || typeof entertainment.reviews.combinedAverageRating !== 'number') {
      return {
        rating: 0,
        ratingCount: 0,
        fullStars: 0,
        hasHalfStar: false
      };
    }

    const rating = entertainment.reviews.combinedAverageRating;
    return {
      rating,
      ratingCount: entertainment.reviews.totalReviews,
      fullStars: Math.floor(rating),
      hasHalfStar: (rating % 1) >= 0.5
    };
  },

  cleanDescription: (description: string): string => {
    if (!description) return '';
    return description
      .replace(/[\r\n]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  // Get display name (handles both old and new API)
  getDisplayName: (entertainment: Entertainment): string => {
    return entertainment.name || entertainment.title || 'Untitled';
  },

  // Get display code (handles both old and new API)
  getDisplayCode: (entertainment: Entertainment): string => {
    return entertainment.code || entertainment.productCode || entertainment.id;
  }
};