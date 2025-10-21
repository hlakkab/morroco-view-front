/**
 * LazyFallback Component
 * 
 * Animated loading skeleton shown while lazy-loaded screens are loading.
 * Provides visual feedback to users during screen transitions.
 * 
 * Features:
 * - Smooth fade-in animation
 * - Brand-colored spinner
 * - Minimal, unobtrusive design
 */

import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View } from 'react-native';

interface LazyFallbackProps {
  /**
   * Optional screen name for debugging
   */
  screenName?: string;
}

/**
 * Animated loading fallback for lazy-loaded screens
 */
export const LazyFallback: React.FC<LazyFallbackProps> = ({ screenName }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in background
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Show spinner after a brief delay (avoid flash for fast loads)
    const spinnerTimer = setTimeout(() => {
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 100);

    // Log for debugging
    if (__DEV__ && screenName) {
      console.log(`⏳ Loading ${screenName}...`);
    }

    return () => clearTimeout(spinnerTimer);
  }, [fadeAnim, spinnerOpacity, screenName]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={{ opacity: spinnerOpacity }}>
        <ActivityIndicator size="large" color="#CE1126" />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF7F7', // Match app background
  },
});

export default LazyFallback;

