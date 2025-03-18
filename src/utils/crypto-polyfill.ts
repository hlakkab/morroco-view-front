import * as Crypto from 'expo-crypto';

// Polyfill for crypto.getRandomValues
if (typeof window !== 'undefined' && !window.crypto) {
  (window as any).crypto = {
    getRandomValues: async (array: Uint8Array) => {
      const randomBytes = await Crypto.getRandomBytesAsync(array.length);
      array.set(randomBytes);
      return array;
    }
  };
} 