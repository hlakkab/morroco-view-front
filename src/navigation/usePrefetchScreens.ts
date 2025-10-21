/**
 * Auth-Aware Screen Prefetch Hook - Option B+ (Enhanced + Observable)
 * Morocco View v1.1.7 - React Native 0.81.3 + Hermes
 * 
 * Intelligently prefetches screens based on user authentication state and usage patterns.
 * Combines tiered prefetching with auth-aware logic for optimal performance.
 * 
 * Features:
 * - 🔓 Public screens: Always prefetched (explore categories, public services)
 * - 🔐 Auth screens: Only prefetched when user is authenticated
 * - ⚡ Dynamic response: Prefetches auth screens immediately when user logs in mid-session
 * - 📊 Performance tracking: Logs prefetch timing and success rates
 * - 🔄 Handles login/logout cycles gracefully
 * 
 * @see AUTH_AWARE_PREFETCH_STRATEGY.md for detailed documentation
 */

import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';
import { prefetchScreens } from './LazyScreen';
import { trackPrefetch } from '../utils/trackScreenLoad';

// ========== STATIC IMPORT REGISTRY ==========
// Metro bundler requires static import paths - no dynamic template strings!

/**
 * Static import map for prefetch screens
 * Organized by authentication tier for conditional loading
 */
const screenImports = {
  // 🔐 Auth-protected screens (Tier 1: Bottom Nav)
  Bookmark: () => import('../Bookmarks/screens/BookmarkScreen'),
  Tours: () => import('../Tours/screens/ToursScreen'),
  Tickets: () => import('../Tickets/screens/TicketsScreen'),
  Account: () => import('../Account/screens/AccountScreen'),
  
  // 🔐 Auth-protected screens (Tier 3: Services)
  ESIM: () => import('../ESIM/screens/ESIMScreen'),
  QRCodes: () => import('../QRCode/screens/QRCodesScreen'),
  
  // 🔓 Public screens (Tier 2: Explore Categories)
  Monuments: () => import('../Monument/screens/MonumentsScreen'),
  Restaurant: () => import('../Restaurant/screens/RestaurantScreen'),
  Entertainment: () => import('../Entertainment/screens/EntertainmentScreenVo'),
  Artisans: () => import('../Artisan/screens/ArtisansScreen'),
  
  // 🔓 Public screens (Tier 3: Services)
  HotelPickup: () => import('../Pickup/screens/HotelPickupScreen'),
  MoneyExchange: () => import('../MoneyExchange/screens/MoneyExchangeScreen'),
};

/**
 * Measure and track prefetch performance
 * Wraps import function with timing and analytics
 */
const measurePrefetch = async (
  screenName: string,
  importFn: () => Promise<any>,
  tier: 'public' | 'auth'
): Promise<void> => {
  const startTime = Date.now();
  let success = false;

  try {
    await importFn();
    success = true;
  } catch (error) {
    console.error(`❌ [Prefetch] Failed to load ${screenName}:`, error);
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    trackPrefetch(screenName, duration, tier, success);
    
    // Send to Flipper if available
    if (typeof globalThis !== 'undefined' && (globalThis as any).__flipper) {
      try {
        (globalThis as any).__flipper.emit('prefetch_complete', {
          screenName,
          duration,
          tier,
          success,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        // Silently fail
      }
    }
  }
};

/**
 * 🔐 Auth-Aware Screen Prefetch Hook
 * 
 * Main hook for managing screen prefetching based on authentication state.
 * Call this from HomeScreen after mount.
 * 
 * @param isAuthenticated - Current user authentication state
 * 
 * @example
 * ```tsx
 * const { isAuthenticated } = useAuth();
 * usePrefetchScreens(isAuthenticated());
 * ```
 */
export const usePrefetchScreens = (isAuthenticated: boolean) => {
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const hasPrefetchedPublicRef = useRef(false);
  const hasPrefetchedAuthRef = useRef(false);
  const prevAuthRef = useRef(isAuthenticated);

  /**
   * Prefetch public (non-auth) screens
   * These are always prefetched regardless of auth state
   */
  const prefetchPublicScreens = () => {
    if (hasPrefetchedPublicRef.current) {
      if (__DEV__) console.log('⏭️  [Prefetch] Public screens already prefetched, skipping');
      return;
    }

    if (__DEV__) console.log('🔓 [Prefetch Strategy] Starting PUBLIC screen prefetch');

    InteractionManager.runAfterInteractions(() => {
      // Tier 2: Explore Categories (5s delay)
      const tier2Timer = setTimeout(() => {
        if (__DEV__) console.log('🔓 [Prefetch] Tier 2 starting (Explore Categories - Public)');
        
        const tier2Imports: Array<[() => Promise<any>, string]> = [
          [() => measurePrefetch('Monuments', screenImports.Monuments, 'public'), 'Monuments'],
          [() => measurePrefetch('Restaurant', screenImports.Restaurant, 'public'), 'Restaurant'],
          [() => measurePrefetch('Entertainment', screenImports.Entertainment, 'public'), 'Entertainment'],
          [() => measurePrefetch('Artisans', screenImports.Artisans, 'public'), 'Artisans'],
        ];
        
        prefetchScreens(tier2Imports, 0).catch((error) => {
          console.error('❌ [Prefetch] Public Tier 2 failed:', error);
        });
      }, 5000);

      // Tier 3: Service Screens (8s delay)
      const tier3Timer = setTimeout(() => {
        if (__DEV__) console.log('🔓 [Prefetch] Tier 3 starting (Services - Public)');
        
        const tier3Imports: Array<[() => Promise<any>, string]> = [
          [() => measurePrefetch('HotelPickup', screenImports.HotelPickup, 'public'), 'HotelPickup'],
          [() => measurePrefetch('MoneyExchange', screenImports.MoneyExchange, 'public'), 'MoneyExchange'],
        ];
        
        prefetchScreens(tier3Imports, 0).catch((error) => {
          console.error('❌ [Prefetch] Public Tier 3 failed:', error);
        });
      }, 8000);

      timersRef.current.push(tier2Timer, tier3Timer);
    });

    hasPrefetchedPublicRef.current = true;
  };

  /**
   * Prefetch authentication-protected screens
   * Only called when user is authenticated
   * 
   * @param baseDelay - Optional delay before starting prefetch (0 for immediate)
   */
  const prefetchAuthScreens = (baseDelay: number = 0) => {
    if (hasPrefetchedAuthRef.current) {
      if (__DEV__) console.log('⏭️  [Prefetch] Auth screens already prefetched, skipping');
      return;
    }

    if (__DEV__) console.log('🔐 [Prefetch Strategy] Starting AUTH screen prefetch');

    InteractionManager.runAfterInteractions(() => {
      // Tier 1: Bottom Nav Auth Screens (2s delay + baseDelay)
      const tier1Timer = setTimeout(() => {
        if (__DEV__) console.log('🔐 [Prefetch] Tier 1 starting (Bottom Nav - Auth)');
        
        const tier1Imports: Array<[() => Promise<any>, string]> = [
          [() => measurePrefetch('Bookmark', screenImports.Bookmark, 'auth'), 'Bookmark'],
          [() => measurePrefetch('Tours', screenImports.Tours, 'auth'), 'Tours'],
          [() => measurePrefetch('Tickets', screenImports.Tickets, 'auth'), 'Tickets'],
          [() => measurePrefetch('Account', screenImports.Account, 'auth'), 'Account'],
        ];
        
        prefetchScreens(tier1Imports, 0).catch((error) => {
          console.error('❌ [Prefetch] Auth Tier 1 failed:', error);
        });
      }, baseDelay + 2000);

      // Tier 3: Service Auth Screens (8s delay + baseDelay)
      const tier3Timer = setTimeout(() => {
        if (__DEV__) console.log('🔐 [Prefetch] Tier 3 starting (Services - Auth)');
        
        const tier3Imports: Array<[() => Promise<any>, string]> = [
          [() => measurePrefetch('ESIM', screenImports.ESIM, 'auth'), 'ESIM'],
          [() => measurePrefetch('QRCodes', screenImports.QRCodes, 'auth'), 'QRCodes'],
        ];
        
        prefetchScreens(tier3Imports, 0).catch((error) => {
          console.error('❌ [Prefetch] Auth Tier 3 failed:', error);
        });
      }, baseDelay + 8000);

      timersRef.current.push(tier1Timer, tier3Timer);
    });

    hasPrefetchedAuthRef.current = true;
  };

  // ========== INITIAL PREFETCH ON MOUNT ==========
  useEffect(() => {
    if (__DEV__) {
      console.log(
        `🚀 [Prefetch Strategy] Initializing with auth state: ${
          isAuthenticated ? 'AUTHENTICATED 🔐' : 'NOT AUTHENTICATED 🔓'
        }`
      );
    }

    // Always prefetch public screens
    prefetchPublicScreens();

    // Prefetch auth screens if already authenticated
    if (isAuthenticated) {
      prefetchAuthScreens();
    }

    return () => {
      // Cleanup timers on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []); // Only run once on mount

  // ========== WATCH FOR AUTH STATE CHANGES ==========
  useEffect(() => {
    // User just logged in?
    if (isAuthenticated && !prevAuthRef.current) {
      if (__DEV__) {
        console.log('🔐✨ [Prefetch Strategy] User logged in mid-session! Triggering immediate auth prefetch');
      }
      // Prefetch auth screens immediately (no delay)
      prefetchAuthScreens(0);
    }

    // User logged out?
    if (!isAuthenticated && prevAuthRef.current) {
      if (__DEV__) {
        console.log('🔓 [Prefetch Strategy] User logged out - auth screens will not be prefetched');
      }
      // Reset auth prefetch flag so they can be prefetched again on next login
      hasPrefetchedAuthRef.current = false;
    }

    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);
};

// ========== DETAIL SCREEN PREFETCH ==========

/**
 * Static import map for detail screens
 * Prefetched when user lands on a list/parent screen
 */
const detailScreenImports: Record<string, () => Promise<any>> = {
  MonumentDetail: () => import('../Monument/screens/MonumentDetailScreen'),
  RestaurantDetail: () => import('../Restaurant/screens/RestaurantDetailScreen'),
  EntertainmentDetail: () => import('../Entertainment/screens/EntertainmentDetailScreenVo'),
  ArtisanDetail: () => import('../Artisan/screens/ArtisanDetailScreen'),
  TransportDetail: () => import('../Pickup/screens/TransportDetailScreen'),
  BrokerDetail: () => import('../MoneyExchange/screens/BrokerDetailScreen'),
  EventDetail: () => import('../Event/screens/EventDetailScreen'),
};

/**
 * 🎯 Parent-Triggered Child Screen Prefetch Hook
 * 
 * Prefetches detail screens when user lands on a list/parent screen.
 * Example: Prefetch MonumentDetail when user opens Monuments list.
 * 
 * @param parentScreenName - Name of the parent screen (e.g., 'Monuments')
 * 
 * @example
 * ```tsx
 * // In MonumentsScreen.tsx
 * usePrefetchChildScreens('Monuments');
 * ```
 */
export const usePrefetchChildScreens = (parentScreenName: string) => {
  const hasPrefetchedRef = useRef(false);

  useEffect(() => {
    if (hasPrefetchedRef.current) return;

    const childScreenMap: Record<string, string> = {
      Monuments: 'MonumentDetail',
      Restaurant: 'RestaurantDetail',
      Entertainment: 'EntertainmentDetail',
      Artisans: 'ArtisanDetail',
      HotelPickup: 'TransportDetail',
      MoneyExchange: 'BrokerDetail',
      Events: 'EventDetail',
    };

    const childScreenKey = childScreenMap[parentScreenName];
    if (!childScreenKey || !detailScreenImports[childScreenKey]) {
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      const timer = setTimeout(() => {
        if (__DEV__) {
          console.log(`🎯 [Child Prefetch] Prefetching ${childScreenKey} from ${parentScreenName}`);
        }

        const startTime = Date.now();
        const importFn = detailScreenImports[childScreenKey];
        
        importFn()
          .then(() => {
            const duration = Date.now() - startTime;
            if (__DEV__) {
              console.log(`✅ [Child Prefetch] ${childScreenKey} loaded in ${duration}ms`);
            }
            
            // Track in analytics
            trackPrefetch(childScreenKey, duration, 'public', true);
          })
          .catch((error) => {
            console.error(`❌ [Child Prefetch] Failed to load ${childScreenKey}:`, error);
            trackPrefetch(childScreenKey, 0, 'public', false);
          });
      }, 2000); // 2s delay after parent screen loads

      return () => clearTimeout(timer);
    });

    hasPrefetchedRef.current = true;
  }, [parentScreenName]);
};
