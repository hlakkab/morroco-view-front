export enum ArtisanType {
  Leather = "Leather",
  Pottery = "Pottery",
  Carpets = "Carpets",
  Metalwork = "Metalwork",
  Woodwork = "Woodwork",
  Textiles = "Textiles",
}

export interface City {
  id: string;
  name: string;
  code: string;
}

export interface Artisan {
  id: string;
  images?: string[];
  saved?: boolean;
  code: string;
  name: string;
  description?: string;
  type: string; // Artisan type
  spotType: string; // "ARTISAN"
  address: string;
  mapId: string;
  coordinates: string; // Format: "x,y" from backend
  startTime?: string;
  endTime?: string;
  city: City | string; // Can be object or string for backward compatibility
  phoneNumber?: string;
  email?: string;
  website?: string;
  tag?: string; // Ex: "🧵 Artisan Souk" - optional for backward compatibility
  visitingHours?: string; // Ex: "09:00-17:00"
  location?: string; // For backward compatibility
  isFeatured?: boolean; // Featured artisan flag
  about?: string; // Detailed description
  specialties?: string[]; // What this souk is known for
} 