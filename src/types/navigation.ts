import { NavigationProp } from "@react-navigation/native";
import { Restaurant } from "./Restaurant";

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
    MonumentDetail: {
        id: string;
        name: string;
        imageUrl?: string;
        location: string;
        rating?: number;
        isFeatured?: boolean;
        visitingHours?: string;
        entryFee?: string;
        website?: string;
        about?: string;
    };
    Restaurant: undefined;
    RestaurantDetail: Restaurant;   
    Entertainment: undefined;
    EntertainmentDetail: {
        productCode: string;
        title: string;
      };
    Artisans: undefined;
    Bookmark: undefined;
    Tickets: undefined;
    Tours: undefined;
    Account: undefined;
    EmergencyContacts: undefined;
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
};

// Type alias for use with useNavigation hook
export type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;