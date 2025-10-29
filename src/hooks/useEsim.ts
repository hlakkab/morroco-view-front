import { useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../service/Mixpanel';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { createEsim, fetchEsims } from '../ESIM/store/esimSlice';
import Esim from '../ESIM/types/esim';

/**
 * Custom hook to handle ESIM operations
 * Provides state management, authentication checks, and common ESIM operations
 */
export const useEsim = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { esims, loading, error } = useAppSelector((state) => state.esim);

  /**
   * Fetch all ESIMs for the authenticated user
   */
  const loadEsims = useCallback(async () => {
    if (!isAuthenticated()) {
      console.warn('User must be authenticated to fetch ESIMs');
      return null;
    }

    try {
      trackEvent('ESIM_Fetch_Started');
      const result = await dispatch(fetchEsims()).unwrap();
      trackEvent('ESIM_Fetch_Success', {
        count: result.length
      });
      return result;
    } catch (err) {
      trackEvent('ESIM_Fetch_Failed', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      console.error('Failed to fetch ESIMs:', err);
      throw err;
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Purchase/Create a new ESIM
   */
  const purchaseEsim = useCallback(async (
    operatorId: string,
    price: number,
    offer: string = 'Standard Plan'
  ) => {
    if (!isAuthenticated()) {
      console.warn('User must be authenticated to purchase ESIM');
      throw new Error('Authentication required');
    }

    try {
      const newEsim = {
        operator: operatorId,
        offer: offer,
        price: price,
        simNumber: `SIM-${Date.now()}`
      };

      trackEvent('ESIM_Purchase_Started', {
        operator: operatorId,
        offer: offer,
        price: price
      });

      const result = await dispatch(createEsim(newEsim)).unwrap();

      trackEvent('ESIM_Purchase_Success', {
        operator: operatorId,
        offer: offer,
        price: price,
        simNumber: result.simNumber
      });

      return result;
    } catch (err) {
      trackEvent('ESIM_Purchase_Failed', {
        operator: operatorId,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      console.error('Failed to purchase ESIM:', err);
      throw err;
    }
  }, [dispatch, isAuthenticated]);

  /**
   * Find an ESIM by ID
   */
  const findEsimById = useCallback((id: string): Esim | undefined => {
    return esims.find(esim => esim.id === id);
  }, [esims]);

  /**
   * Find ESIMs by operator
   */
  const findEsimsByOperator = useCallback((operator: string): Esim[] => {
    return esims.filter(esim => 
      esim.operator.toLowerCase() === operator.toLowerCase()
    );
  }, [esims]);

  /**
   * Get total number of active ESIMs
   */
  const getActiveEsimsCount = useCallback((): number => {
    return esims.length;
  }, [esims]);

  /**
   * Get total value of all ESIMs
   */
  const getTotalEsimsValue = useCallback((): number => {
    return esims.reduce((total, esim) => total + esim.price, 0);
  }, [esims]);

  /**
   * Check if user has any ESIMs
   */
  const hasEsims = useCallback((): boolean => {
    return esims.length > 0;
  }, [esims]);

  /**
   * Check if user has a specific operator ESIM
   */
  const hasOperatorEsim = useCallback((operator: string): boolean => {
    return esims.some(esim => 
      esim.operator.toLowerCase() === operator.toLowerCase()
    );
  }, [esims]);

  /**
   * Get unique operators from user's ESIMs
   */
  const getUniqueOperators = useCallback((): string[] => {
    const operators = esims.map(esim => esim.operator);
    return Array.from(new Set(operators));
  }, [esims]);

  /**
   * Auto-fetch ESIMs on mount if authenticated
   * Note: Disabled auto-fetch to prevent conflicts with manual loading in screens
   */
  // useEffect(() => {
  //   if (isAuthenticated() && esims.length === 0 && !loading && !error) {
  //     loadEsims().catch(err => {
  //       console.error('Auto-fetch ESIMs failed:', err);
  //     });
  //   }
  // }, [isAuthenticated, esims.length, loading, error, loadEsims]);

  return {
    // State
    esims,
    loading,
    error,
    isAuthenticated: isAuthenticated(),

    // Actions
    loadEsims,
    purchaseEsim,

    // Utilities
    findEsimById,
    findEsimsByOperator,
    getActiveEsimsCount,
    getTotalEsimsValue,
    hasEsims,
    hasOperatorEsim,
    getUniqueOperators,
  };
};

