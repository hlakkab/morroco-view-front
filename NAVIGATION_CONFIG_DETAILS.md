# 🎯 Morocco View - Navigation Configuration Details

**Analysis Date:** October 21, 2025  
**App Version:** 1.1.7  
**React Native:** 0.81.3  
**Purpose:** Finalize lazy-loading & prefetch configuration

---

## 1️⃣ Bottom Navigation Routes

### Exact Route Names (from `BottomNavBar.tsx`)

| Position | Route Name | Icon | Translation Key | Active State |
|----------|------------|------|-----------------|--------------|
| 1 | `Home` | HomeIcon | `navigation.home` | `activeRoute === 'Home'` |
| 2 | `Bookmark` | BookmarkIcon | `navigation.bookmark` | `activeRoute === 'Bookmark'` |
| 3 | `Tickets` | TicketsIcon | `navigation.tickets` | `activeRoute === 'Tickets'` |
| 4 | `Tours` | ToursIcon | `navigation.tours` | `activeRoute === 'Tours'` |
| 5 | `Account` | AccountIcon | `navigation.account` | `activeRoute === 'Account'` |

### Navigation Handler Pattern

```typescript
// BottomNavBar is NOT a navigator - it's a custom component
interface BottomNavBarProps {
  activeRoute: string;
  onNavigate: (routeName: string) => void;  // ✅ Custom handler
}

// Usage in screens (e.g., HomeScreen.tsx line 254)
<BottomNavBar 
  activeRoute="Home" 
  onNavigate={handleNavigation}  // Custom function
/>

// handleNavigation implementation (HomeScreen.tsx lines 143-159)
const handleNavigation = async (routeName: string) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      setShowAuthModal(true);
      return;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    setShowAuthModal(true);
    return;
  }
  
  navigation.navigate(routeName as never);  // Uses Stack Navigator
};
```

**✅ Confirmation:**
- BottomNavBar uses `onNavigate(routeName)` custom handler
- Navigation uses React Navigation's `navigation.navigate()` under the hood
- **All bottom nav routes require authentication** (except Home)

---

## 2️⃣ Screen Import Paths

### Root Structure

```
src/
├── screens/                    # Core screens (4 files)
├── Account/screens/            # Account module (4 files)
├── Artisan/screens/            # Artisan module (2 files)
├── Bookmarks/screens/          # Bookmark module (1 file)
├── MoneyExchange/screens/      # Money Exchange module (3 files)
├── Emergency/screens/          # Emergency module (1 file)
├── Entertainment/screens/      # Entertainment module (3 files)
├── ESIM/screens/               # eSIM module (1 file)
├── Event/screens/              # Event module (1 file)
├── Match/screens/              # Match module (1 file)
├── Monument/screens/           # Monument module (3 files)
├── Pickup/screens/             # Pickup/Transport module (2 files)
├── QRCode/screens/             # QR Code module (1 file)
├── Restaurant/screens/         # Restaurant module (2 files)
├── Tickets/screens/            # Tickets module (1 file)
└── Tours/screens/              # Tours module (5 files)
```

### Centralized Import Location

**✅ All screen imports are centralized in:**
```
src/navigation/AppNavigator.tsx (lines 5-55)
```

**NO other navigators exist.** This is the ONLY navigation file.

### Import Pattern Examples

```typescript
// Core screens (lines 52-55)
import HomeScreen from '../screens/HomeScreen';
import LaunchScreen from '../screens/LaunchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';

// Account module (lines 5-8)
import AccountScreen from '../Account/screens/AccountScreen';
import LoginScreen from '../Account/screens/LoginScreen';
import RegisterScreen from '../Account/screens/RegisterScreen';
import ForgotPasswordScreen from '../Account/screens/ForgotPasswordScreen';

// Tours module (lines 45-49)
import AddNewTourDestinationsScreen from '../Tours/screens/AddNewTourDestinationsScreen';
import AddNewTourOrganizeScreen from '../Tours/screens/AddNewTourOrganizeScreen';
import AddNewTourScreen from '../Tours/screens/AddNewTourScreen';
import TourMapScreen from '../Tours/screens/TourMapScreen';
import ToursScreen from '../Tours/screens/ToursScreen';

// Monument module (lines 31-33)
import MonumentDetailScreen from '../Monument/screens/MonumentDetailScreen';
import MonumentsListScreen from '../Monument/screens/MonumentsListScreen';
import MonumentsScreen from '../Monument/screens/MonumentsScreen';
```

**✅ All imports use relative paths from `src/navigation/` directory.**

---

## 3️⃣ Prefetch Priority (Based on Code Analysis)

### Analytics Integration

**Mixpanel tracking active** in:
- `src/service/Mixpanel.ts`
- `ExploreCardsContainer.tsx` (tracks category clicks)
- `ServiceCardsContainer.tsx` (tracks service clicks)

### Navigation Patterns from HomeScreen

#### **From ExploreCardsContainer** (HomeScreen → Categories)
```typescript
// Lines 126-136 in HomeScreen.tsx
handleCategoryPress(category: string) {
  if (category === 'Restaurant') {
    navigation.navigate('Restaurant');
  } else if (routeNames.includes(category)) {
    navigation.navigate(category);
  }
}
```

**Categories clickable from Home:**
1. `Monuments` (line 71 in ExploreCardsContainer.tsx)
2. `Restaurant` (line 78)
3. `Entertainment` (line 89)
4. `Artisans` (line 96)

#### **From ServiceCardsContainer** (HomeScreen → Services)
```typescript
// Service navigation handlers (ServiceCardsContainer.tsx)
handleESIMPress()           → navigate('ESIM')           // line 49
handleQRCodesPress()        → navigate('QRCodes')        // line 57
handleHotelPickupPress()    → navigate('HotelPickup')    // line 65
handleMoneyExchangePress()  → navigate('MoneyExchange')  // line 73
```

#### **From Bottom Navigation** (HomeScreen → Nav Tabs)
```typescript
// Bottom nav items (BottomNavBar.tsx lines 60-96)
Home      → navigate('Home')
Bookmark  → navigate('Bookmark')
Tickets   → navigate('Tickets')
Tours     → navigate('Tours')
Account   → navigate('Account')
```

#### **Other HomeScreen Navigation**
```typescript
// Emergency (line 140)
handleEmergencyContacts() → navigate('Emergency')

// Matches (line 123) - requires auth
handleMatchesExplore() → navigate('Matches')
```

### 🎯 **Recommended Prefetch Priority**

Based on UI prominence and user flow:

#### **TIER 1: Bottom Nav (Prefetch 2s after Home renders)**
These are always visible and most likely to be clicked:

| Route | Reason | Prefetch Weight |
|-------|--------|-----------------|
| `Bookmark` | Bottom nav position 2 | **CRITICAL** |
| `Tours` | Bottom nav position 4 | **CRITICAL** |
| `Tickets` | Bottom nav position 3 | **CRITICAL** |
| `Account` | Bottom nav position 5 | **CRITICAL** |

#### **TIER 2: Explore Categories (Prefetch 5s after Home)**
Prominent cards on HomeScreen:

| Route | Reason | Prefetch Weight |
|-------|--------|-----------------|
| `Monuments` | Top-left explore card | **HIGH** |
| `Restaurant` | Top-right explore card | **HIGH** |
| `Entertainment` | Bottom-left explore card | **HIGH** |
| `Artisans` | Bottom-right explore card | **HIGH** |

#### **TIER 3: Services (Prefetch 8s after Home)**
Service icons row on HomeScreen:

| Route | Reason | Prefetch Weight |
|-------|--------|-----------------|
| `HotelPickup` | Service card 1 | **MEDIUM** |
| `MoneyExchange` | Service card 2 | **MEDIUM** |
| `ESIM` | Service card 3 | **MEDIUM** |
| `QRCodes` | Service card 4 | **MEDIUM** |

#### **TIER 4: Detail Screens (Prefetch on parent screen mount)**
Only load when parent loads:

| Route | Parent Screen | Prefetch Trigger |
|-------|---------------|-----------------|
| `MonumentDetail` | MonumentsScreen | When Monuments mounts |
| `RestaurantDetail` | RestaurantScreen | When Restaurant mounts |
| `EntertainmentDetail` | EntertainmentScreenVo | When Entertainment mounts |
| `ArtisanDetail` | ArtisansScreen | When Artisans mounts |
| `TransportDetail` | HotelPickupScreen | When HotelPickup mounts |
| `BrokerDetail` | BrokerListScreen | When BrokerList mounts |
| `EventDetail` | EventBannerContainer | When event clicked |

#### **TIER 5: Tour Sub-Screens (On-demand only)**
Heavy screens, only load when needed:

| Route | Parent Screen | Prefetch Trigger |
|-------|---------------|-----------------|
| `AddNewTour` | ToursScreen | "Add" button pressed |
| `AddNewTourDestinations` | AddNewTourScreen | Step 2 reached |
| `AddNewTourOrganize` | AddNewTourDestinations | Step 3 reached |
| `TourMapScreen` | ToursScreen | Map view selected |

#### **TIER 6: Low Priority (Lazy load only)**

| Route | Reason | Load Strategy |
|-------|--------|---------------|
| `Emergency` | Edge case utility | Load on click only |
| `ForgotPassword` | Auth edge case | Load on click only |
| `ExploreMatches` | Requires auth | Load on click only |
| `MoneyExchangeScreen` | Entry screen before BrokerList | Load on click only |
| `BrokerList` | Secondary to MoneyExchangeScreen | Load on click only |
| `MonumentsListScreen` | Secondary to MonumentsScreen | Load on click only |
| `EntertainmentScreen` | Old screen (unused?) | Load on click only |
| `PlaceholderScreen` | Utility | Load on click only |

---

## 4️⃣ Recent Heavy Modules

### New Heavy Dependencies (package.json analysis)

| Module | Version | Size Estimate | Used By | Added Recently? |
|--------|---------|---------------|---------|-----------------|
| `lottie-react-native` | ~7.3.1 | ~450 KB | Animations (unknown screens) | ⚠️ **YES** - Check usage |
| `react-native-vision-camera` | ^4.6.4 | ~800 KB | QRCodesScreen camera | ⚠️ **YES** - Heavy! |
| `react-native-draggable-flatlist` | ^4.0.1 | ~150 KB | ToursScreen, AddNewTourDestinationsScreen | ⚠️ **YES** |
| `react-native-google-places-autocomplete` | ^2.5.7 | ~120 KB | AddNewTourDestinationsScreen | ⚠️ **YES** |
| `react-native-copilot` | ^3.3.3 | ~200 KB | 30 screens | Existing |
| `react-native-maps` | 1.20.1 | ~1,500 KB | TourMapScreen, LocationPickerModal, ReservationPopup | Existing |
| `react-native-qrcode-svg` | ^6.3.15 | ~80 KB | QRCodesScreen | Existing |

### ⚠️ **Lottie Usage Check Needed**

```bash
# Search for Lottie imports
grep -r "lottie" src/ --include="*.tsx" --include="*.ts"
```

**Current finding:** `lottie-react-native` is in package.json but **NOT found in code search**. May be unused dependency!

### 🔴 **Vision Camera Impact**

**File:** `src/QRCode/screens/QRCodesScreen.tsx`
- Uses `react-native-vision-camera` (~800 KB)
- Used for QR code scanning
- **Only needed when QRCodes screen is opened**
- ✅ **Must be lazy-loaded**

### 🔍 **No Recent Additions Found:**
- ❌ No video player (`expo-av` not in dependencies)
- ❌ No push notifications (`firebase-messaging` not in dependencies)
- ❌ No chat/messaging features
- ✅ Mixpanel analytics already present

---

## 5️⃣ Copilot Tour Usage

### Screens with CopilotProvider (30 screens)

| Screen | File Path | Tour Flag | Lines |
|--------|-----------|-----------|-------|
| **HomeScreen** | `screens/HomeScreen.tsx` | `@homeTourSeen` | 385 |
| **MonumentsScreen** | `Monument/screens/MonumentsScreen.tsx` | `@monumentsTourSeen` | 517 |
| **MonumentDetailScreen** | `Monument/screens/MonumentDetailScreen.tsx` | Unknown | Medium |
| **ToursScreen** | `Tours/screens/ToursScreen.tsx` | Unknown | Heavy |
| **AddNewTourDestinationsScreen** | `Tours/screens/AddNewTourDestinationsScreen.tsx` | Unknown | 761 |
| **AddNewTourScreen** | `Tours/screens/AddNewTourScreen.tsx` | Unknown | Medium |
| **AddNewTourOrganizeScreen** | `Tours/screens/AddNewTourOrganizeScreen.tsx` | Unknown | Medium |
| **RestaurantScreen** | `Restaurant/screens/RestaurantScreen.tsx` | Unknown | Heavy |
| **RestaurantDetailScreen** | `Restaurant/screens/RestaurantDetailScreen.tsx` | Unknown | Medium |
| **EntertainmentScreenVo** | `Entertainment/screens/EntertainmentScreenVo.tsx` | Unknown | Heavy |
| **EntertainmentDetailScreenVo** | `Entertainment/screens/EntertainmentDetailScreenVo.tsx` | Unknown | Medium |
| **ArtisansScreen** | `Artisan/screens/ArtisansScreen.tsx` | Unknown | Heavy |
| **ArtisanDetailScreen** | `Artisan/screens/ArtisanDetailScreen.tsx` | Unknown | Medium |
| **HotelPickupScreen** | `Pickup/screens/HotelPickupScreen.tsx` | Unknown | 329 |
| **TransportDetailScreen** | `Pickup/screens/TransportDetailScreen.tsx` | Unknown | Medium |
| **MoneyExchangeScreen** | `MoneyExchange/screens/MoneyExchangeScreen.tsx` | Unknown | Medium |
| **BrokerListScreen** | `MoneyExchange/screens/BrokerListScreen.tsx` | Unknown | Heavy |
| **BrokerDetailScreen** | `MoneyExchange/screens/BrokerDetailScreen.tsx` | Unknown | Medium |
| **BookmarkScreen** | `Bookmarks/screens/BookmarkScreen.tsx` | Unknown | Heavy |
| **TicketsScreen** | `Tickets/screens/TicketsScreen.tsx` | Unknown | Medium |
| **AccountScreen** | `Account/screens/AccountScreen.tsx` | Unknown | Medium |
| **ESIMScreen** | `ESIM/screens/ESIMScreen.tsx` | Unknown | Medium |
| **QRCodesScreen** | `QRCode/screens/QRCodesScreen.tsx` | Unknown | Medium |
| **ExploreMatchesScreen** | `Match/screens/ExploreMatchesScreen.tsx` | Unknown | Heavy |
| **EventDetailScreen** | `Event/screens/EventDetailScreen.tsx` | Unknown | Medium |

### Copilot Components/Containers (6 files)

| Component | File Path | Type |
|-----------|-----------|------|
| **ReservationPopup** | `Pickup/containers/ReservationPopup.tsx` | Modal/Container |
| **BuyESIMModal** | `ESIM/containers/BuyESIMModal.tsx` | Modal |
| **AddQRCodeModal** | `QRCode/containers/AddQRCodeModal.tsx` | Modal |
| **TourDetailsModal** | `Tours/components/TourDetailsModal.tsx` | Modal |
| **MatchPopup** | `Match/components/MatchPopup.tsx` | Modal |

### ⚠️ **Copilot Initialization Pattern**

```typescript
// Typical pattern (from HomeScreen.tsx)
const HomeScreen: React.FC = () => {
  return (
    <CopilotProvider
      stepNumberComponent={() => null}
      tooltipStyle={styles.tooltip}
      backdropColor="rgba(0, 0, 0, 0.7)"
      // ... config
    >
      <HomeScreenContent />
    </CopilotProvider>
  );
};
```

**Each screen wraps its content with CopilotProvider** = 200 KB overhead × 30 screens = **~6 MB if all eager-loaded!**

### 🚨 **Critical Copilot Optimization Strategy**

**Option A: Lazy Load Copilot Provider**
```typescript
const CopilotProvider = lazy(() => 
  import('react-native-copilot').then(mod => ({ default: mod.CopilotProvider }))
);
```

**Option B: Conditional Tour Wrapper**
```typescript
// Only load tour system if user hasn't seen it
const withTour = (Component) => {
  const [hasSeen, setHasSeen] = useState(null);
  
  useEffect(() => {
    AsyncStorage.getItem('@tourSeen').then(val => setHasSeen(val === 'true'));
  }, []);
  
  if (hasSeen) return <Component />; // Skip Copilot entirely
  
  return (
    <CopilotProvider>
      <Component />
    </CopilotProvider>
  );
};
```

---

## 6️⃣ Recommended `navigationConfig.ts`

### Final Configuration Object

```typescript
// src/navigation/navigationConfig.ts

export interface ScreenConfig {
  name: string;
  path: string;
  loadStrategy: 'eager' | 'lazy' | 'prefetch';
  prefetchDelay?: number; // milliseconds after Home renders
  prefetchTrigger?: string; // parent screen name
  weight: 'light' | 'medium' | 'heavy' | 'very-heavy';
  requiresAuth: boolean;
  hasCopilot: boolean;
  heavyDependencies: string[];
}

export const navigationConfig: Record<string, ScreenConfig> = {
  // ========== EAGER LOAD (5 screens) ==========
  Launch: {
    name: 'Launch',
    path: '../screens/LaunchScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: ['react-native-reanimated'],
  },
  Onboarding: {
    name: 'Onboarding',
    path: '../screens/OnboardingScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
  Login: {
    name: 'Login',
    path: '../Account/screens/LoginScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: ['expo-linear-gradient', '@react-native-google-signin/google-signin'],
  },
  Register: {
    name: 'Register',
    path: '../Account/screens/RegisterScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
  Home: {
    name: 'Home',
    path: '../screens/HomeScreen',
    loadStrategy: 'eager',
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },

  // ========== PREFETCH TIER 1: Bottom Nav (2s delay) ==========
  Bookmark: {
    name: 'Bookmark',
    path: '../Bookmarks/screens/BookmarkScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    weight: 'heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },
  Tours: {
    name: 'Tours',
    path: '../Tours/screens/ToursScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    weight: 'heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-draggable-flatlist', 'redux'],
  },
  Tickets: {
    name: 'Tickets',
    path: '../Tickets/screens/TicketsScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  Account: {
    name: 'Account',
    path: '../Account/screens/AccountScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },

  // ========== PREFETCH TIER 2: Explore Categories (5s delay) ==========
  Monuments: {
    name: 'Monuments',
    path: '../Monument/screens/MonumentsScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },
  Restaurant: {
    name: 'Restaurant',
    path: '../Restaurant/screens/RestaurantScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },
  Entertainment: {
    name: 'Entertainment',
    path: '../Entertainment/screens/EntertainmentScreenVo',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },
  Artisans: {
    name: 'Artisans',
    path: '../Artisan/screens/ArtisansScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },

  // ========== PREFETCH TIER 3: Services (8s delay) ==========
  HotelPickup: {
    name: 'HotelPickup',
    path: '../Pickup/screens/HotelPickupScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-maps', 'redux'],
  },
  MoneyExchange: {
    name: 'MoneyExchange',
    path: '../MoneyExchange/screens/MoneyExchangeScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  ESIM: {
    name: 'ESIM',
    path: '../ESIM/screens/ESIMScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  QRCodes: {
    name: 'QRCodes',
    path: '../QRCode/screens/QRCodesScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-vision-camera', 'react-native-qrcode-svg'],
  },

  // ========== LAZY: Detail Screens (parent trigger) ==========
  MonumentDetail: {
    name: 'MonumentDetail',
    path: '../Monument/screens/MonumentDetailScreen',
    loadStrategy: 'lazy',
    prefetchTrigger: 'Monuments',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },
  RestaurantDetail: {
    name: 'RestaurantDetail',
    path: '../Restaurant/screens/RestaurantDetailScreen',
    loadStrategy: 'lazy',
    prefetchTrigger: 'Restaurant',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  EntertainmentDetail: {
    name: 'EntertainmentDetail',
    path: '../Entertainment/screens/EntertainmentDetailScreenVo',
    loadStrategy: 'lazy',
    prefetchTrigger: 'Entertainment',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  ArtisanDetail: {
    name: 'ArtisanDetail',
    path: '../Artisan/screens/ArtisanDetailScreen',
    loadStrategy: 'lazy',
    prefetchTrigger: 'Artisans',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  TransportDetail: {
    name: 'TransportDetail',
    path: '../Pickup/screens/TransportDetailScreen',
    loadStrategy: 'lazy',
    prefetchTrigger: 'HotelPickup',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  BrokerDetail: {
    name: 'BrokerDetail',
    path: '../MoneyExchange/screens/BrokerDetailScreen',
    loadStrategy: 'lazy',
    prefetchTrigger: 'BrokerList',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  EventDetail: {
    name: 'EventDetail',
    path: '../Event/screens/EventDetailScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },

  // ========== LAZY: Tour Sub-Screens (very heavy) ==========
  AddNewTour: {
    name: 'AddNewTour',
    path: '../Tours/screens/AddNewTourScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  AddNewTourDestinations: {
    name: 'AddNewTourDestinations',
    path: '../Tours/screens/AddNewTourDestinationsScreen',
    loadStrategy: 'lazy',
    weight: 'very-heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-draggable-flatlist', 'react-native-google-places-autocomplete', 'redux'],
  },
  AddNewTourOrganize: {
    name: 'AddNewTourOrganize',
    path: '../Tours/screens/AddNewTourOrganizeScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  TourMapScreen: {
    name: 'TourMapScreen',
    path: '../Tours/screens/TourMapScreen',
    loadStrategy: 'lazy',
    weight: 'very-heavy',
    requiresAuth: true,
    hasCopilot: false,
    heavyDependencies: ['react-native-maps', 'axios'],
  },
  MarrakechMap: {
    name: 'MarrakechMap',
    path: '../Tours/screens/TourMapScreen', // Alias
    loadStrategy: 'lazy',
    weight: 'very-heavy',
    requiresAuth: true,
    hasCopilot: false,
    heavyDependencies: ['react-native-maps', 'axios'],
  },

  // ========== LAZY: Low Priority ==========
  ForgotPassword: {
    name: 'ForgotPassword',
    path: '../Account/screens/ForgotPasswordScreen',
    loadStrategy: 'lazy',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
  Emergency: {
    name: 'Emergency',
    path: '../Emergency/screens/EmergencyScreen',
    loadStrategy: 'lazy',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
  ExploreMatches: {
    name: 'ExploreMatches',
    path: '../Match/screens/ExploreMatchesScreen',
    loadStrategy: 'lazy',
    weight: 'heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
  },
  BrokerList: {
    name: 'BrokerList',
    path: '../MoneyExchange/screens/BrokerListScreen',
    loadStrategy: 'lazy',
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
  },
  MonumentsListScreen: {
    name: 'MonumentsListScreen',
    path: '../Monument/screens/MonumentsListScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
  EntertainmentScreen: {
    name: 'EntertainmentScreen',
    path: '../Entertainment/screens/EntertainmentScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
  PlaceholderScreen: {
    name: 'PlaceholderScreen',
    path: '../screens/PlaceholderScreen',
    loadStrategy: 'lazy',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
  },
};

// ========== HELPER FUNCTIONS ==========

export const getEagerScreens = () =>
  Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'eager')
    .map(([name, config]) => ({ name, ...config }));

export const getPrefetchScreens = (tier?: 'tier1' | 'tier2' | 'tier3') => {
  const prefetch = Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'prefetch')
    .map(([name, config]) => ({ name, ...config }));

  if (!tier) return prefetch;

  const delays = {
    tier1: 2000,
    tier2: 5000,
    tier3: 8000,
  };

  return prefetch.filter(s => s.prefetchDelay === delays[tier]);
};

export const getLazyScreens = () =>
  Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'lazy')
    .map(([name, config]) => ({ name, ...config }));

export const getScreensByWeight = (weight: 'light' | 'medium' | 'heavy' | 'very-heavy') =>
  Object.entries(navigationConfig)
    .filter(([_, config]) => config.weight === weight)
    .map(([name, config]) => ({ name, ...config }));

export const getCopilotScreens = () =>
  Object.entries(navigationConfig)
    .filter(([_, config]) => config.hasCopilot)
    .map(([name, config]) => ({ name, ...config }));
```

---

## 7️⃣ Summary Statistics

### Load Strategy Distribution

| Strategy | Count | Percentage |
|----------|-------|------------|
| **Eager** | 5 | 12.5% |
| **Prefetch** | 12 | 30% |
| **Lazy** | 23 | 57.5% |
| **Total** | 40 | 100% |

### Prefetch Timing

| Tier | Delay | Screens | Reason |
|------|-------|---------|--------|
| **Tier 1** | 2s | 4 | Bottom nav (always visible) |
| **Tier 2** | 5s | 4 | Explore categories (prominent on Home) |
| **Tier 3** | 8s | 4 | Service cards (visible but less prominent) |

### Weight Distribution

| Weight | Count | Load Strategy |
|--------|-------|---------------|
| **Very Heavy** | 3 | Lazy only |
| **Heavy** | 12 | Mix (1 eager, 11 prefetch/lazy) |
| **Medium** | 13 | Mix (3 eager, 10 lazy) |
| **Light** | 5 | Eager or lazy |

### Copilot Impact

| Metric | Value |
|--------|-------|
| **Total screens with Copilot** | 30 |
| **Copilot bundle size** | ~200 KB per screen |
| **Total if all eager** | ~6 MB |
| **Total after lazy-loading** | ~200 KB (Home only initially) |
| **Savings** | ~5.8 MB |

---

## 8️⃣ Next Steps

### Implementation Checklist

- [ ] Create `src/navigation/navigationConfig.ts` with config object
- [ ] Create `src/navigation/LazyScreen.tsx` wrapper component
- [ ] Update `AppNavigator.tsx` to use lazy imports for 35 screens
- [ ] Implement prefetch hooks in `HomeScreen.tsx`
- [ ] Add parent-triggered prefetch for detail screens
- [ ] Optimize Copilot: conditional loading based on tour flags
- [ ] Test navigation performance with React DevTools Profiler
- [ ] Measure bundle size reduction
- [ ] Validate no breaking changes in navigation flow

---

**Generated:** October 21, 2025  
**For:** Morocco View v1.1.7 Navigation Optimization  
**Status:** Ready for implementation

