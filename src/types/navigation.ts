import { NavigationProp } from "@react-navigation/native";
import { Restaurant } from "./Restaurant";
import { Monument } from "./Monument";
import { Event } from "./Event";

interface SavedItem {
    id: string;
    type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
    title: string;
    subtitle?: string;
    city: string;
    duration?: string;
    timeSlot?: string;
    coordinate?: {
        latitude: number;
        longitude: number;
    };
}

export type RootStackParamList = {
    Launch: undefined;
    Onboarding: undefined;
    Login: undefined;
    Home: undefined;
    ESIM: undefined;
    QRCodes: undefined;
    HotelPickup: undefined;
    TransportDetail: {
        id: string;
        title: string;
        imageUrl: string;
        price?: number;
        isPrivate?: boolean;
    };
    BrokerDetail: {
        id: string;
        name: string;
        imageUrl?: string;
        location: string;
        rating?: number;
        isFeatured?: boolean;
        exchangeRates?: {
            buy: number;
            sell: number;
        };
        services?: string[];
        operatingHours?: string;
        contactNumber?: string;
        website?: string;
        about?: string;
        isSaved?: boolean;
    };
    Matches: undefined;
    Monuments: undefined;
    MonumentDetail: Monument;
    Restaurant: undefined;
    RestaurantDetail: Restaurant;   
    Entertainment: undefined;
    EntertainmentDetail: {
        productCode: string;
        title: string;
    };
    Events: undefined;
    EventDetail: Event;
    Artisans: undefined;
    Bookmark: undefined;
    Tickets: undefined;
    Tours: undefined;
    Account: undefined;
    Emergency: undefined;
    MoneyExchange: undefined;
    BrokerList: undefined;
    ExploreMatches: undefined;
    Test: undefined;
    AddNewTour: undefined;
    AddNewTourDestinations: {
        title: string;
        startDate: string;
        endDate: string;
    };
    MarrakechMap: undefined;
    TourMapScreen: {
        tourItems: SavedItem[];
    };
    AddNewTourOrganize: {
        title: string;
        startDate: string;
        endDate: string;
        selectedItemsByDay: Record<number, string[]>;
        cities: Record<number, string>;
        savedItems: SavedItem[];
    };
};

// Type alias for use with useNavigation hook
export type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;