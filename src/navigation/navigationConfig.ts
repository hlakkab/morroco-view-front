/**
 * Navigation Configuration for Lazy Loading Optimization - Option B+ (Auth-Aware)
 * Morocco View v1.1.7 - React Native 0.81.3 + Hermes
 * 
 * This configuration defines load strategies for all screens to optimize
 * startup performance and reduce initial bundle size.
 * 
 * Enhanced with:
 * - Auth-aware prefetch tiers ('public' | 'auth')
 * - Analytics integration (screen names)
 * - Custom fallback animations (shimmer types)
 */

export type LoadStrategy = 'eager' | 'lazy' | 'prefetch';
export type ScreenWeight = 'light' | 'medium' | 'heavy' | 'very-heavy';
export type PrefetchTier = 'public' | 'auth';
export type ShimmerType = 'default' | 'map' | 'list';

export interface ScreenConfig {
  name: string;
  path: string;
  loadStrategy: LoadStrategy;
  prefetchDelay?: number; // milliseconds after Home renders
  prefetchTrigger?: string; // parent screen name
  prefetchTier?: PrefetchTier; // NEW: public or auth-protected
  weight: ScreenWeight;
  requiresAuth: boolean;
  hasCopilot: boolean;
  heavyDependencies: string[];
  analyticsName?: string; // NEW: for analytics tracking
  shimmerType?: ShimmerType; // NEW: loading animation type
}

export const navigationConfig: Record<string, ScreenConfig> = {
  // ========== EAGER LOAD (5 screens - Critical Path) ==========
  Launch: {
    name: 'Launch',
    path: '../screens/LaunchScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: ['react-native-reanimated'],
    analyticsName: 'launch_screen',
    shimmerType: 'default',
  },
  Onboarding: {
    name: 'Onboarding',
    path: '../screens/OnboardingScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'onboarding_screen',
    shimmerType: 'default',
  },
  Login: {
    name: 'Login',
    path: '../Account/screens/LoginScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: ['expo-linear-gradient'],
    analyticsName: 'login_screen',
    shimmerType: 'default',
  },
  Register: {
    name: 'Register',
    path: '../Account/screens/RegisterScreen',
    loadStrategy: 'eager',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'register_screen',
    shimmerType: 'default',
  },
  Home: {
    name: 'Home',
    path: '../screens/HomeScreen',
    loadStrategy: 'eager',
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'home_screen',
    shimmerType: 'default',
  },

  // ========== PREFETCH TIER 1: Bottom Nav - AUTH PROTECTED (2s delay) ==========
  Bookmark: {
    name: 'Bookmark',
    path: '../Bookmarks/screens/BookmarkScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    prefetchTier: 'auth', // 🔐 Auth-protected
    weight: 'heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
    analyticsName: 'bookmarks_screen',
    shimmerType: 'list',
  },
  Tours: {
    name: 'Tours',
    path: '../Tours/screens/ToursScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    prefetchTier: 'auth', // 🔐 Auth-protected
    weight: 'heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-draggable-flatlist'],
    analyticsName: 'tours_screen',
    shimmerType: 'list',
  },
  Tickets: {
    name: 'Tickets',
    path: '../Tickets/screens/TicketsScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    prefetchTier: 'auth', // 🔐 Auth-protected
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'tickets_screen',
    shimmerType: 'list',
  },
  Account: {
    name: 'Account',
    path: '../Account/screens/AccountScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 2000,
    prefetchTier: 'auth', // 🔐 Auth-protected
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'account_screen',
    shimmerType: 'default',
  },

  // ========== PREFETCH TIER 2: Explore Categories - PUBLIC (5s delay) ==========
  Monuments: {
    name: 'Monuments',
    path: '../Monument/screens/MonumentsScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    prefetchTier: 'public', // 🔓 Public
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
    analyticsName: 'monuments_screen',
    shimmerType: 'list',
  },
  Restaurant: {
    name: 'Restaurant',
    path: '../Restaurant/screens/RestaurantScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    prefetchTier: 'public', // 🔓 Public
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
    analyticsName: 'restaurants_screen',
    shimmerType: 'list',
  },
  Entertainment: {
    name: 'Entertainment',
    path: '../Entertainment/screens/EntertainmentScreenVo',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    prefetchTier: 'public', // 🔓 Public
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
    analyticsName: 'entertainment_screen',
    shimmerType: 'list',
  },
  Artisans: {
    name: 'Artisans',
    path: '../Artisan/screens/ArtisansScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 5000,
    prefetchTier: 'public', // 🔓 Public
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
    analyticsName: 'artisans_screen',
    shimmerType: 'list',
  },

  // ========== PREFETCH TIER 3: Services - MIXED (8s delay) ==========
  HotelPickup: {
    name: 'HotelPickup',
    path: '../Pickup/screens/HotelPickupScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    prefetchTier: 'public', // 🔓 Public
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-maps'],
    analyticsName: 'hotel_pickup_screen',
    shimmerType: 'map',
  },
  MoneyExchange: {
    name: 'MoneyExchange',
    path: '../MoneyExchange/screens/MoneyExchangeScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    prefetchTier: 'public', // 🔓 Public
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'money_exchange_screen',
    shimmerType: 'list',
  },
  ESIM: {
    name: 'ESIM',
    path: '../ESIM/screens/ESIMScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    prefetchTier: 'auth', // 🔐 Auth-protected
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'esim_screen',
    shimmerType: 'default',
  },
  QRCodes: {
    name: 'QRCodes',
    path: '../QRCode/screens/QRCodesScreen',
    loadStrategy: 'prefetch',
    prefetchDelay: 8000,
    prefetchTier: 'auth', // 🔐 Auth-protected
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'react-native-vision-camera'],
    analyticsName: 'qr_codes_screen',
    shimmerType: 'default',
  },

  // ========== LAZY: Detail Screens ==========
  MonumentDetail: {
    name: 'MonumentDetail',
    path: '../Monument/screens/MonumentDetailScreen',
    loadStrategy: 'lazy',
    prefetchTrigger: 'Monuments',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'monument_detail_screen',
    shimmerType: 'default',
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
    analyticsName: 'restaurant_detail_screen',
    shimmerType: 'default',
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
    analyticsName: 'entertainment_detail_screen',
    shimmerType: 'default',
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
    analyticsName: 'artisan_detail_screen',
    shimmerType: 'default',
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
    analyticsName: 'transport_detail_screen',
    shimmerType: 'default',
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
    analyticsName: 'broker_detail_screen',
    shimmerType: 'default',
  },
  EventDetail: {
    name: 'EventDetail',
    path: '../Event/screens/EventDetailScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'event_detail_screen',
    shimmerType: 'default',
  },

  // ========== LAZY: Tour Sub-Screens (Very Heavy) ==========
  AddNewTour: {
    name: 'AddNewTour',
    path: '../Tours/screens/AddNewTourScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'add_new_tour_screen',
    shimmerType: 'default',
  },
  AddNewTourDestinations: {
    name: 'AddNewTourDestinations',
    path: '../Tours/screens/AddNewTourDestinationsScreen',
    loadStrategy: 'lazy',
    weight: 'very-heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: [
      'react-native-copilot',
      'react-native-draggable-flatlist',
      'react-native-google-places-autocomplete',
    ],
    analyticsName: 'add_tour_destinations_screen',
    shimmerType: 'list',
  },
  AddNewTourOrganize: {
    name: 'AddNewTourOrganize',
    path: '../Tours/screens/AddNewTourOrganizeScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'add_tour_organize_screen',
    shimmerType: 'default',
  },
  TourMapScreen: {
    name: 'TourMapScreen',
    path: '../Tours/screens/TourMapScreen',
    loadStrategy: 'lazy',
    weight: 'very-heavy',
    requiresAuth: true,
    hasCopilot: false,
    heavyDependencies: ['react-native-maps', 'axios'],
    analyticsName: 'tour_map_screen',
    shimmerType: 'map',
  },
  MarrakechMap: {
    name: 'MarrakechMap',
    path: '../Tours/screens/TourMapScreen', // Alias to TourMapScreen
    loadStrategy: 'lazy',
    weight: 'very-heavy',
    requiresAuth: true,
    hasCopilot: false,
    heavyDependencies: ['react-native-maps', 'axios'],
    analyticsName: 'marrakech_map_screen',
    shimmerType: 'map',
  },

  // ========== LAZY: Secondary/Utility Screens ==========
  ForgotPassword: {
    name: 'ForgotPassword',
    path: '../Account/screens/ForgotPasswordScreen',
    loadStrategy: 'lazy',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'forgot_password_screen',
    shimmerType: 'default',
  },
  Emergency: {
    name: 'Emergency',
    path: '../Emergency/screens/EmergencyScreen',
    loadStrategy: 'lazy',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'emergency_screen',
    shimmerType: 'list',
  },
  ExploreMatches: {
    name: 'ExploreMatches',
    path: '../Match/screens/ExploreMatchesScreen',
    loadStrategy: 'lazy',
    weight: 'heavy',
    requiresAuth: true,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot'],
    analyticsName: 'explore_matches_screen',
    shimmerType: 'list',
  },
  BrokerList: {
    name: 'BrokerList',
    path: '../MoneyExchange/screens/BrokerListScreen',
    loadStrategy: 'lazy',
    weight: 'heavy',
    requiresAuth: false,
    hasCopilot: true,
    heavyDependencies: ['react-native-copilot', 'redux'],
    analyticsName: 'broker_list_screen',
    shimmerType: 'list',
  },
  MonumentsListScreen: {
    name: 'MonumentsListScreen',
    path: '../Monument/screens/MonumentsListScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'monuments_list_screen',
    shimmerType: 'list',
  },
  EntertainmentScreen: {
    name: 'EntertainmentScreen',
    path: '../Entertainment/screens/EntertainmentScreen',
    loadStrategy: 'lazy',
    weight: 'medium',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'entertainment_list_screen',
    shimmerType: 'list',
  },
  PlaceholderScreen: {
    name: 'PlaceholderScreen',
    path: '../screens/PlaceholderScreen',
    loadStrategy: 'lazy',
    weight: 'light',
    requiresAuth: false,
    hasCopilot: false,
    heavyDependencies: [],
    analyticsName: 'placeholder_screen',
    shimmerType: 'default',
  },
};

// ========== HELPER FUNCTIONS ==========

/**
 * Get all screens that should be eagerly loaded (critical path)
 */
export const getEagerScreens = (): Array<ScreenConfig & { name: string }> => {
  return Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'eager')
    .map(([_, config]) => config as ScreenConfig & { name: string });
};

/**
 * Get screens to prefetch, optionally filtered by tier
 * @param tier - 'tier1' (2s), 'tier2' (5s), 'tier3' (8s)
 */
export const getPrefetchScreens = (
  tier?: 'tier1' | 'tier2' | 'tier3'
): Array<ScreenConfig & { name: string }> => {
  const prefetch = Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'prefetch')
    .map(([_, config]) => config as ScreenConfig & { name: string });

  if (!tier) return prefetch;

  const delayMap = {
    tier1: 2000,
    tier2: 5000,
    tier3: 8000,
  };

  return prefetch.filter((s) => s.prefetchDelay === delayMap[tier]);
};

/**
 * Get prefetch screens by authentication tier
 * @param prefetchTier - 'public' or 'auth'
 */
export const getPrefetchScreensByTier = (
  prefetchTier: PrefetchTier
): Array<ScreenConfig & { name: string }> => {
  return Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'prefetch' && config.prefetchTier === prefetchTier)
    .map(([_, config]) => config as ScreenConfig & { name: string });
};

/**
 * Get all screens that should be lazy loaded
 */
export const getLazyScreens = (): Array<ScreenConfig & { name: string }> => {
  return Object.entries(navigationConfig)
    .filter(([_, config]) => config.loadStrategy === 'lazy')
    .map(([_, config]) => config as ScreenConfig & { name: string });
};

/**
 * Get screens by weight classification
 */
export const getScreensByWeight = (
  weight: ScreenWeight
): Array<ScreenConfig & { name: string }> => {
  return Object.entries(navigationConfig)
    .filter(([_, config]) => config.weight === weight)
    .map(([_, config]) => config as ScreenConfig & { name: string });
};

/**
 * Get all screens that use Copilot tours
 */
export const getCopilotScreens = (): Array<ScreenConfig & { name: string }> => {
  return Object.entries(navigationConfig)
    .filter(([_, config]) => config.hasCopilot)
    .map(([_, config]) => config as ScreenConfig & { name: string });
};

/**
 * Get screen config by name
 */
export const getScreenConfig = (screenName: string): ScreenConfig | undefined => {
  return navigationConfig[screenName];
};

/**
 * Get screens that should be prefetched when a parent screen mounts
 */
export const getChildScreensForPrefetch = (
  parentScreenName: string
): Array<ScreenConfig & { name: string }> => {
  return Object.entries(navigationConfig)
    .filter(([_, config]) => config.prefetchTrigger === parentScreenName)
    .map(([_, config]) => config as ScreenConfig & { name: string });
};

// ========== STATISTICS ==========

export const navigationStats = {
  total: Object.keys(navigationConfig).length,
  eager: getEagerScreens().length,
  prefetch: getPrefetchScreens().length,
  prefetchPublic: getPrefetchScreensByTier('public').length,
  prefetchAuth: getPrefetchScreensByTier('auth').length,
  lazy: getLazyScreens().length,
  copilot: getCopilotScreens().length,
  veryHeavy: getScreensByWeight('very-heavy').length,
  heavy: getScreensByWeight('heavy').length,
  medium: getScreensByWeight('medium').length,
  light: getScreensByWeight('light').length,
};

// Log stats in development
if (__DEV__) {
  console.log('📊 Navigation Config Stats (Option B+):', navigationStats);
  console.log('⚡ Eager screens:', getEagerScreens().map((s) => s.name));
  console.log('📦 Prefetch Tier 1 (2s):', getPrefetchScreens('tier1').map((s) => s.name));
  console.log('📦 Prefetch Tier 2 (5s):', getPrefetchScreens('tier2').map((s) => s.name));
  console.log('📦 Prefetch Tier 3 (8s):', getPrefetchScreens('tier3').map((s) => s.name));
  console.log('🔓 Public prefetch:', getPrefetchScreensByTier('public').map((s) => s.name));
  console.log('🔐 Auth prefetch:', getPrefetchScreensByTier('auth').map((s) => s.name));
}
