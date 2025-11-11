import { useCallback, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import type {
  PaywallLaunchPayload,
  PaywallLaunchResponse,
  PaywallStatus
} from '../types';
import { launchPaywall } from '../services/paywallApi';

interface UsePaywallOptions {
  defaultCurrency?: string;
}

interface UsePaywallReturn {
  status: PaywallStatus;
  error: string | null;
  data: PaywallLaunchResponse | null;
  isReady: boolean;
  reset: () => void;
  start: (payload: PaywallLaunchPayload) => Promise<PaywallLaunchResponse>;
}

export const usePaywall = (options: UsePaywallOptions = {}): UsePaywallReturn => {
  const [status, setStatus] = useState<PaywallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaywallLaunchResponse | null>(null);

  const start = useCallback(async (payload: PaywallLaunchPayload) => {
    setStatus('loading');
    setError(null);

    const requestPayload: PaywallLaunchPayload = {
      ...payload,
      currency: payload.currency ?? options.defaultCurrency
    };

    try {
      const response = await launchPaywall(requestPayload);
      setData(response);
      setStatus('ready');
      return response;
    } catch (err) {
      let message = 'Unable to start payment flow.';

      if (isAxiosError(err)) {
        const status = err.response?.status;
        const statusText = err.response?.statusText;
        const backendData = err.response?.data;
        const details = typeof backendData === 'string'
          ? backendData
          : backendData ? JSON.stringify(backendData) : undefined;

        message = status
          ? `Payment request failed (${status}${statusText ? ` ${statusText}` : ''})`
          : 'Payment request failed.';

        if (details) {
          message = `${message}: ${details}`;
        }
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }

      
      console.error('[Paywall] launch error', err);
      

      setError(message);
      setStatus('error');
      throw new Error(message);
    }
  }, [options.defaultCurrency]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setData(null);
  }, []);

  const isReady = useMemo(() => status === 'ready' && data !== null, [data, status]);

  return {
    status,
    error,
    data,
    isReady,
    reset,
    start
  };
};
