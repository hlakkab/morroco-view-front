export enum ArtisanType {
  Leather = "Leather",
  Pottery = "Pottery",
  Carpets = "Carpets",
  Metalwork = "Metalwork",
  Woodwork = "Woodwork",
  Textiles = "Textiles",
}

export interface Artisan {
  id: string;
  tag: string; // Ex: "🧵 Artisan Souk"
  name: string; // Ex: "Souk Semmarine"
  description?: string; // Ex: "Famous for its handcrafted leather goods..."
  address: string;
  coordinates: string; // Format: "x,y" from backend
  images?: string[]; // Multiple images for details page
  visitingHours?: string; // Ex: "09:00-17:00"
  type: ArtisanType; // Type of artisan souk
  mapId: string;
  saved?: boolean; // Indicates if the artisan is bookmarked
  website?: string;
  startTime?: string;
  endTime?: string;
  location?: string; // For backward compatibility
  isFeatured?: boolean; // Featured artisan flag
  about?: string; // Detailed description
  city: string;
  specialties?: string[]; // What this souk is known for
} 