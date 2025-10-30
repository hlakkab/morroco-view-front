import Constants from 'expo-constants';

type OptionalString = string | undefined;

export const getGoogleMapsApiKey = (): OptionalString => {
  const keyFromExtra = Constants.expoConfig?.extra?.googlePlacesApiKey as OptionalString;
  const keyFromIos = Constants.expoConfig?.ios?.config?.googleMapsApiKey as OptionalString;
  const keyFromAndroid = (Constants.expoConfig?.android as any)?.config?.googleMaps?.apiKey as OptionalString;

  return keyFromExtra || keyFromIos || keyFromAndroid;
};

export const getExpoExtra = <T = any>(path?: string): T | undefined => {
  if (!path) return Constants.expoConfig?.extra as T | undefined;
  const segments = path.split('.');
  let current: any = Constants.expoConfig?.extra;
  for (const seg of segments) {
    if (current == null) return undefined;
    current = current[seg];
  }
  return current as T | undefined;
};

export const getConfigSource = (): 'extra' | 'ios' | 'android' | 'none' => {
  if (Constants.expoConfig?.extra?.googlePlacesApiKey) return 'extra';
  if (Constants.expoConfig?.ios?.config?.googleMapsApiKey) return 'ios';
  if ((Constants.expoConfig?.android as any)?.config?.googleMaps?.apiKey) return 'android';
  return 'none';
};


