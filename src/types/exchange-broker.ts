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
    saved?: boolean;
    services?: string[];
    startTime?: string;
    endTime?: string;
    phoneNumber?: string;
    website?: string;
    description?: string;
    mapId?: string;
  }

export interface ExchangeBrokerState {
    brokers: Broker[];
    loading: boolean;
    error: string | null;
    locations: string[];
    selectedLocation: string;
  }