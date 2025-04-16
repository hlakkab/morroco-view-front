export enum MonumentType {
  Historical = "Historical",
  Religious = "Religious",
  Cultural = "Cultural",
  Architectural = "Architectural",
  Modern = "Modern",
  Archaeological = "Archaeological",
}

export interface Monument {
  id: string;
  tag: string; // Ex: "🏛️ Monument"
  name: string; // Ex: "Koutoubia Mosque"
  description?: string; // Ex: "The iconic mosque of Marrakech, located in the Medina..."
  address: string;
  coordinates: number[];
  mapUrl?: string; // URL of the Google Maps location
  images?: string[]; // Multiple images for details page
  visitingHours?: string; // Ex: "09:00-17:00"
  entryFee?: string; // Ex: "70" (in MAD)
  type: MonumentType; // Type of monument
  mapId: string;
  saved?: boolean; // Indicates if the monument is bookmarked
  website?: string;
  startTime?: string;
  endTime?: string;
  location?: string; // For backward compatibility
  isFeatured?: boolean; // Featured monument flag
  about?: string; // Detailed description
} 