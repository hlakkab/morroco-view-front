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

// Type pour le pricing
export interface PricingSummary {
  fromPrice: number;
  fromPriceBeforeDiscount?: number;
}

export interface Pricing {
  summary: PricingSummary;
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

// Type principal Entertainment
export interface Entertainment {
  id?: string;
  productCode: string;
  title: string;
  description: string;
  location: string;
  images: EntertainmentImage[];
  reviews: Reviews;
  pricing: Pricing;

  // Champs calculés pour l'UI
  fullStars?: number;
  hasHalfStar?: boolean;
  mapUrl?: string;

  // Champs détaillés (issus du GET /products/{product-code})
  itinerary?: Itinerary;
  logistics?: Logistics;
  ticketInfo?: TicketInfo;
  languageGuides?: LanguageGuide[];
}

// Fonctions utilitaires (helpers)
export const entertainmentHelpers = {
  getPrimaryImageUrl: (entertainment: Entertainment): string => {
    // Vérification que les images existent
    if (!entertainment.images || entertainment.images.length === 0) {
      return 'https://via.placeholder.com/300';
    }

    // Recherche l'image de couverture ou la première image disponible
    const coverImage = entertainment.images.find(img => img.isCover);
    const image = coverImage || entertainment.images[0];

    if (!image?.variants?.length) {
      return 'https://via.placeholder.com/300';
    }

    // Trie des variantes par taille décroissante et prend celle avec une largeur idéale
    const sortedVariants = [...image.variants].sort((a, b) =>
      (b.width * b.height) - (a.width * a.height)
    );

    const idealVariant = sortedVariants.find(v =>
      v.width >= 720 && v.width <= 1080
    ) || sortedVariants[0];

    return idealVariant?.url || 'https://via.placeholder.com/300';
  },

  getFormattedPrice: (entertainment: Entertainment): string => {
    // Vérification que le prix existe
    if (!entertainment.pricing || !entertainment.pricing.summary || !entertainment.pricing.summary.fromPrice) {
      return '0.00';
    }
    return entertainment.pricing.summary.fromPrice.toFixed(2);
  },

  getRatingInfo: (entertainment: Entertainment) => {
    // Vérification que les reviews existent
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
  // Fonction pour nettoyer et formater la description
  cleanDescription: (description: string): string => {
    if (!description) return '';
    return description
      .replace(/[\r\n]+/g, ' ') // Remplace retours chariot/nouvelle ligne par un espace
      .replace(/\s+/g, ' ')     // Réduit les espaces multiples à un seul
      .trim();                  // Supprime les espaces en début et fin de chaîne
  }

};