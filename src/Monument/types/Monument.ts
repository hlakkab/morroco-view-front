export enum MonumentType {
  Historical = "Historical",
  Religious = "Religious",
  Cultural = "Cultural",
  Architectural = "Architectural",
  Modern = "Modern",
  Archaeological = "Archaeological",
}

export interface City {
  id: string;
  name: string;
  code: string;
}

export interface Monument {
  id: string;
  images?: string[];
  saved?: boolean;
  code: string;
  name: string;
  description?: string;
  type: string; // Monument type
  spotType: string; // "MONUMENT"
  address: string;
  mapId: string;
  coordinates: string; // Format: "x,y" from backend
  startTime?: string;
  endTime?: string;
  city: City | string; // Can be object or string for backward compatibility
  phoneNumber?: string;
  email?: string;
  website?: string;
  tag?: string; // Ex: "🏛️ Monument" - optional for backward compatibility
  visitingHours?: string; // Ex: "09:00-17:00"
  entryFee?: string; // Ex: "70" (in MAD)
  location?: string; // For backward compatibility
  isFeatured?: boolean; // Featured monument flag
  about?: string; // Detailed description
} 