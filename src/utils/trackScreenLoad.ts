/**
 * Analytics Utility for Screen Load Tracking
 * Morocco View - Option B+ (Enhanced + Auth-Aware)
 * 
 * Tracks screen load performance for analytics and monitoring.
 * Currently logs to console in DEV mode - ready for Firebase Analytics integration.
 * 
 * Usage:
 * ```typescript
 * import { trackScreenLoad } from '../utils/trackScreenLoad';
 * 
 * // After screen loads
 * trackScreenLoad('Monuments', 342, { source: 'lazy', fromScreen: 'Home' });
 * ```
 */

interface TrackScreenLoadOptions {
  /**
   * How was the screen loaded? ('eager' | 'lazy')
   */
  source?: 'eager' | 'lazy';
  
  /**
   * Which screen triggered the navigation?
   */
  fromScreen?: string;
  
  /**
   * Was the user authenticated?
   */
  isAuthenticated?: boolean;
  
  /**
   * Any additional custom properties
   */
  [key: string]: any;
}

/**
 * Track screen load time and metadata
 * 
 * @param screenName - Name of the screen (e.g., 'Monuments', 'Home')
 * @param loadTimeMs - Time taken to load the screen in milliseconds
 * @param options - Additional tracking metadata
 */
export const trackScreenLoad = (
  screenName: string,
  loadTimeMs: number,
  options?: TrackScreenLoadOptions
): void => {
  // Console logging in development
  if (__DEV__) {
    const emoji = loadTimeMs < 100 ? '⚡' : loadTimeMs < 500 ? '✅' : '⚠️';
    console.log(
      `${emoji} [Analytics] Screen loaded: ${screenName} (${loadTimeMs}ms)`,
      options ? `\n  ${JSON.stringify(options, null, 2)}` : ''
    );
  }

  // TODO: Integrate with your analytics provider
  // Examples:
  
  // Firebase Analytics:
  // analytics().logEvent('screen_load', {
  //   screen_name: screenName,
  //   load_time_ms: loadTimeMs,
  //   ...options,
  // });

  // Custom Analytics:
  // Analytics.track('Screen Load', {
  //   screen: screenName,
  //   duration: loadTimeMs,
  //   ...options,
  // });

  // Flipper Plugin (for debugging):
  if (typeof globalThis !== 'undefined' && (globalThis as any).__flipper) {
    try {
      (globalThis as any).__flipper.emit('screen_load', {
        screenName,
        loadTimeMs,
        timestamp: new Date().toISOString(),
        ...options,
      });
    } catch (error) {
      // Silently fail if Flipper is not available
    }
  }
};


/**
 * Track navigation events
 * Call this when user navigates to a screen
 */
export const trackNavigation = (
  fromScreen: string,
  toScreen: string,
  method: 'tap' | 'deeplink' | 'notification' | 'back'
): void => {
  if (__DEV__) {
    console.log(`🧭 [Analytics] Navigation: ${fromScreen} → ${toScreen} (${method})`);
  }

  // TODO: Integrate with analytics
  // analytics().logEvent('navigation', {
  //   from_screen: fromScreen,
  //   to_screen: toScreen,
  //   method,
  // });
};

export default {
  trackScreenLoad,
  trackNavigation,
};

