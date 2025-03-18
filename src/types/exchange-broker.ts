export interface Broker {
    id: string;
    name: string;
    imageUrl?: string;
    address: string;
    city: string;
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