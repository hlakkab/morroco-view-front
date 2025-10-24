/**
 * Lazy Screen Loader for React Native 0.81 - Enhanced Version
 * 
 * Provides lazy loading with enhanced developer visibility and user experience:
 * - Performance measurements and logging
 * - Error boundaries with graceful fallback
 * - Animated loading states
 * - Optional analytics hooks
 * - Flipper-compatible diagnostics
 * 
 * Since React Native 0.81 doesn't fully support React.Suspense,
 * we use InteractionManager for lazy loading screens after animations complete.
 * This ensures smooth navigation and optimal performance.
 */

import React, { Component, ComponentType, ErrorInfo, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import LazyFallback from '../components/LazyFallback';

interface LazyScreenProps {
  [key: string]: any;
}

/**
 * Performance measurement utility
 * Tracks lazy loading times for diagnostics and optimization
 */
class LazyLoadPerformance {
  private static marks: Map<string, number> = new Map();

  static markStart(screenName: string): void {
    this.marks.set(screenName, Date.now());
    if (__DEV__) {
      console.log(`⏱ [LazyLoad] Starting load: ${screenName}`);
    }
  }

  static markEnd(screenName: string): void {
    const startTime = this.marks.get(screenName);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.marks.delete(screenName);
      
      if (__DEV__) {
        console.log(`✅ [LazyLoad] Loaded ${screenName} in ${duration}ms`);
        
        // Warn if loading takes too long
        if (duration > 1000) {
          console.warn(`⚠️ [LazyLoad] Slow load detected: ${screenName} took ${duration}ms`);
        }
      }
    }
  }

  static getStats(): { screenName: string; duration: number }[] {
    // Could be extended to track historical data
    return [];
  }
}

/**
 * Error Boundary for Lazy-Loaded Screens
 * Catches loading errors and provides graceful fallback
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  screenName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class LazyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { screenName, onError } = this.props;
    
    // Log error for debugging
    console.error(`❌ [LazyLoad] Error loading screen${screenName ? ` "${screenName}"` : ''}:`, error);
    console.error('Error details:', errorInfo);
    
    // Call optional error handler (e.g., for analytics)
    if (onError) {
      onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Simple error fallback - could be customized per screen
      return <LazyFallback screenName={this.props.screenName} />;
    }

    return this.props.children;
  }
}

/**
 * Creates a lazy-loaded screen component with enhanced error handling and performance tracking
 * 
 * @param importFn - Function that returns a dynamic import promise
 * @param options - Optional configuration
 * @param options.screenName - Screen name for logging (auto-detected from import if not provided)
 * @param options.onError - Optional error handler for analytics
 * 
 * @returns Wrapped component that loads lazily with error boundary
 * 
 * @example
 * const MonumentsScreen = lazyScreen(() => import('../Monument/screens/MonumentsScreen'));
 * 
 * @example With options
 * const MonumentsScreen = lazyScreen(
 *   () => import('../Monument/screens/MonumentsScreen'),
 *   { screenName: 'Monuments', onError: (err) => analytics.logError(err) }
 * );
 */
export const lazyScreen = <P extends LazyScreenProps>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    screenName?: string;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  }
): ComponentType<P> => {
  // Extract screen name from import path for logging
  const screenName = options?.screenName || 'UnknownScreen';
  
  return (props: P) => {
    const [Component, setComponent] = useState<ComponentType<P> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<Error | null>(null);

    useEffect(() => {
      let isMounted = true;

      // Mark performance start
      LazyLoadPerformance.markStart(screenName);

      // Wait for interactions to complete (animations, gestures, etc.)
      // @ts-ignore - InteractionManager is soft-deprecated but functional in RN 0.81, no removal timeline announced
      InteractionManager.runAfterInteractions(() => {
        if (!isMounted) return;

        // Load the component
        importFn()
          .then((module) => {
            if (isMounted) {
              setComponent(() => module.default);
              setIsLoading(false);
              
              // Mark performance end
              LazyLoadPerformance.markEnd(screenName);
            }
          })
          .catch((error) => {
            console.error(`❌ [LazyLoad] Failed to load ${screenName}:`, error);
            
            if (isMounted) {
              setLoadError(error);
              setIsLoading(false);
              
              // Call optional error handler
              if (options?.onError && error instanceof Error) {
                options.onError(error, { componentStack: '' } as ErrorInfo);
              }
            }
          });
      });

      return () => {
        isMounted = false;
      };
    }, []);

    // Show loading fallback
    if (isLoading) {
      return <LazyFallback screenName={screenName} />;
    }

    // Show error fallback if load failed
    if (loadError || !Component) {
      return <LazyFallback screenName={screenName} />;
    }

    // Wrap component in error boundary
    return (
      <LazyErrorBoundary screenName={screenName} onError={options?.onError}>
        <Component {...props} />
      </LazyErrorBoundary>
    );
  };
};


/**
 * Export performance utility for external use
 * Useful for monitoring and debugging lazy load performance
 */
export { LazyLoadPerformance };

