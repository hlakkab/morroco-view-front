export interface Entertainment {
    id: string;
    image?: string;
    images?: string[];
    description?: string;
    title: string; // Titre de l'activité
    location: string; // Lieu de l'activité
    price: string; // Prix en dollars
    rating: number; // Note sur 5 (ex: 4.9)
    ratingCount: number; // Nombre d'avis (ex: 574)
    fullStars: number; // Nombre d'étoiles pleines (ex: 4 pour 4.9)
    hasHalfStar: boolean; // Indique s'il y a une demi-étoile (ex: true pour 4.9)
    mapUrl?: string; // URL Google Maps pour la localisation
  }
  