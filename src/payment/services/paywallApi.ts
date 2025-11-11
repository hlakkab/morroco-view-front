import axios from 'axios';
import type { PaywallLaunchPayload, PaywallLaunchResponse } from '../types';
import { api } from '../../service';

// const PAYWALL_ENDPOINT = 'http://49.13.89.74:9090/paywall/launch';

const PAYWALL_ENDPOINT = '/paywall/launch';



const htmlEntityDecode = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const parseHtmlResponse = (html: string): PaywallLaunchResponse | null => {
  const actionMatch = html.match(/<form[^>]*action="([^"]+)"/i);
  const payloadMatch = html.match(/name="payload"\s+value="([^"]*)"/i) ||
    html.match(/name='payload'\s+value='([^']*)'/i);
  const signatureMatch = html.match(/name="signature"\s+value="([^"]*)"/i) ||
    html.match(/name='signature'\s+value='([^']*)'/i);

  if (!actionMatch || !payloadMatch || !signatureMatch) {
    return null;
  }

  return {
    paywallUrl: htmlEntityDecode(actionMatch[1]),
    payload: htmlEntityDecode(payloadMatch[1]),
    signature: htmlEntityDecode(signatureMatch[1])
  };
};

export async function launchPaywall(payload: PaywallLaunchPayload): Promise<PaywallLaunchResponse> {


  const response = await api.post<PaywallLaunchResponse | string>(PAYWALL_ENDPOINT, payload);

  let result: PaywallLaunchResponse | null = null;

  if (typeof response.data === 'string') {
    result = parseHtmlResponse(response.data);
  } else if (response.data && typeof response.data === 'object') {
    result = response.data as PaywallLaunchResponse;
  }

  if (!result) {
    const error = new Error('Unexpected response from paywall endpoint.');
    if (__DEV__) {
      console.error('[Paywall] unexpected response', response.data);
    }
    throw error;
  }


  return result;
}
