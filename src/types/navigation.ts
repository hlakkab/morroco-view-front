
import { NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
    Launch: undefined;
    Onboarding: undefined;
    Login: undefined;
    Home: undefined;
    ESIM: undefined;
    QRCodes: undefined;
    Matches: undefined;
    Monuments: undefined;
    Restaurant: undefined;
    Entertainment: undefined;
    Artisans: undefined;
    Bookmark: undefined;
    Tickets: undefined;
    Tours: undefined;
    Account: undefined;
    EmergencyContacts: undefined;
    HotelPickup: undefined;
    // Add other screens as your app grows
  };
  
  // Type alias for use with useNavigation hook
  export type HomeScreenNavigationProp = NavigationProp<RootStackParamList>;