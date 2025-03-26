export interface Broker {
    email: any;
    id: string;
    name: string;
    images: string[];
    address: string;
    city: string;
    coordinates: string; // Format: "x,y" from backend
    rating?: number;
    isFeatured?: boolean;
    isSaved?: boolean;
    services?: string[];
    operatingHours?: string;
    phoneNumber?: string;
    website?: string;
    description?: string;
  }

export interface ExchangeBrokerState {
    brokers: Broker[];
    loading: boolean;
    error: string | null;
    locations: string[];
    selectedLocation: string;
  }