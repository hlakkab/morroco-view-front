export enum RestaurantType {
    Gastronomic = "Gastronomic",
    LocalProduct = "Local Product",
    FastCasual = "Fast Casual",
    Patisserie = "Patisserie",
    Traditional = "Traditional",
    Contemporary = "Contemporary",
  }
  
  export interface Restaurant {
    id: string;
    tag: string; // Ex: "🍽️ Restau"
    name: string; // Ex: "Pâtisserie Amandine Marrakech"
    description?: string; // Ex: "Bakery Breakfast Lunch in Marrakesh downtown. Gueliz. Fine French and Moroccan pastries since 1997..."
    address: string;
    coordinates: number[];
    mapUrl?: string; // URL de la carte Google Maps
    images?: string[]; // Plusieurs images pour la page de détails
    startTime: string; // Heure d'ouverture (ex: "08:00")
    endTime: string; // Heure de fermeture (ex: "22:00")
    type: RestaurantType; // Type de restaurant
    mapId: string;
    saved?: boolean; // Indicates if the restaurant is bookmarked
  }
  