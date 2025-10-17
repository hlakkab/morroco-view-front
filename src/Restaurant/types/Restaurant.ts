export enum RestaurantType {
    Gastronomic = "Gastronomic",
    LocalProduct = "Local Product",
    FastCasual = "Fast Casual",
    Patisserie = "Patisserie",
    Traditional = "Traditional",
    Contemporary = "Contemporary",
  }
  
  export interface City {
    id: string;
    name: string;
    code: string;
  }
  
  export interface Restaurant {
    id: string;
    images?: string[];
    saved?: boolean;
    code: string;
    name: string;
    description?: string;
    type: string; // Restaurant type
    spotType: string; // "RESTAURANT"
    address: string;
    mapId: string;
    coordinates: string; // Format: "x,y" from backend
    startTime: string; // Heure d'ouverture (ex: "08:00")
    endTime: string; // Heure de fermeture (ex: "22:00")
    city: City | string; // Can be object or string for backward compatibility
    phoneNumber?: string;
    email?: string;
    website?: string;
    tag?: string; // Ex: "🍽️ Restau" - optional for backward compatibility
    mapUrl?: string; // URL de la carte Google Maps
  }
  