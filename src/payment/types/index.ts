export interface PaywallLaunchPayload {
  amount: number;
  currency?: string;
  clientId?: string;
  description?: string;
}

export interface PaywallLaunchResponse {
  paywallUrl: string;
  payload: string;
  signature: string;
}

export interface PaywallOrderResult {
  orderId: string;
  status: PaywallResult;
}

export type PaywallStatus = 'idle' | 'loading' | 'ready' | 'error';

export type PaywallResult = 'success' | 'failure';
