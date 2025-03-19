// Types pour les images de l'API
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

// Type pour les prix
export interface Pricing {
  summary: {
    fromPrice: number;
    fromPriceBeforeDiscount?: number;
  };
}

// Type principal Entertainment
export interface Entertainment {
  id: string;
  productCode: string;
  title: string;
  description: string;
  location: string;
  // Images
  images: EntertainmentImage[];
  primaryImage?: string; // URL de l'image principale
  // Prix
  pricing: Pricing;
  // Évaluations
  reviews: Reviews;
  // Champs calculés pour l'UI
  fullStars?: number;
  hasHalfStar?: boolean;
  mapUrl?: string;
}

// Helper functions pour manipuler les données Entertainment
export const entertainmentHelpers = {
  getPrimaryImageUrl: (entertainment: Entertainment): string => {
    // Chercher d'abord l'image de couverture
    const coverImage = entertainment.images.find(img => img.isCover);
    const firstImage = entertainment.images[0];
    const image = coverImage || firstImage;

    if (!image?.variants?.length) return '';

    // Trier les variantes par taille et prendre la plus grande
    const sortedVariants = [...image.variants].sort((a, b) => {
      const aSize = a.width * a.height;
      const bSize = b.width * b.height;
      return bSize - aSize; // Tri décroissant
    });

    // Prendre la variante avec la meilleure résolution
    // mais pas trop grande pour éviter les problèmes de performance
    const idealVariant = sortedVariants.find(v => v.width >= 720 && v.width <= 1080) || sortedVariants[0];
    
    return idealVariant?.url || '';
  },

  getFormattedPrice: (entertainment: Entertainment): string => {
    return `${entertainment.pricing.summary.fromPrice.toFixed(2)}`;
  },

  getRatingInfo: (entertainment: Entertainment) => {
    const rating = entertainment.reviews.combinedAverageRating;
    return {
      rating,
      ratingCount: entertainment.reviews.totalReviews,
      fullStars: Math.floor(rating),
      hasHalfStar: (rating % 1) >= 0.5
    };
  }
};
  