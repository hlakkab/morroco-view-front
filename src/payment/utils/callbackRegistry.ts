import type { PaywallResult } from '../types';

type PaywallCallback = (orderId: string, status: PaywallResult) => void | Promise<void>;

const callbackRegistry = new Map<string, PaywallCallback>();

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const registerPaywallCallback = (callback?: PaywallCallback): string | undefined => {
  if (!callback) {
    return undefined;
  }

  const id = generateId();
  callbackRegistry.set(id, callback);
  return id;
};

export const runPaywallCallback = async (
  callbackId: string | undefined,
  orderId: string,
  status: PaywallResult
) => {
  if (!callbackId) {
    return;
  }

  const callback = callbackRegistry.get(callbackId);
  if (!callback) {
    return;
  }

  try {
    await callback(orderId, status);
  } finally {
    callbackRegistry.delete(callbackId);
  }
};

export const clearPaywallCallback = (callbackId: string | undefined) => {
  if (callbackId) {
    callbackRegistry.delete(callbackId);
  }
};











