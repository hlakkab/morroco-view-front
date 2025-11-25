import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import semverGt from 'semver/functions/gt';

const VERSION_ENDPOINT =
  process.env.MOBILE_VERSION_ENDPOINT ??
  'https://morocco-view-assets.s3.eu-south-2.amazonaws.com/version/mview-versions.json';

const STORE_URLS = {
  ios: process.env.IOS_APP_STORE_URL || 'https://apps.apple.com/us/app/morocco-view/id6745827217', // TODO: Replace XXXXXXX with actual App Store ID
  android: process.env.ANDROID_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.moroccoview.app',
};

interface VersionResponse {
  latest_ios: string;
  latest_android: string;
  force_update: boolean;
}

export interface AppVersionCheckResult {
  visible: boolean;
  latestVersion: string | null;
  currentVersion: string;
  forceUpdate: boolean;
  checking: boolean;
  onUpdate: () => void;
  onLater: () => void;
  retry: () => void;
}

const getPlatformStoreUrl = () =>
  Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;

const getLatestVersionFromResponse = (response: VersionResponse) => {
  return Platform.OS === 'ios'
    ? response.latest_ios
    : response.latest_android;
};

export const useAppVersionCheck = (): AppVersionCheckResult => {
  const [visible, setVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const currentVersion = useMemo(() => {
    if (__DEV__) {
      return '1.0.0';
    }
    try {
      const deviceInfo = require('react-native-device-info') as typeof import('react-native-device-info');
      return deviceInfo.getVersion();
    } catch (error) {
      console.warn('Failed to read native app version, falling back', error);
      return '1.0.0';
    }
  }, []);

  const handleUpdate = useCallback(() => {
    const storeUrl = getPlatformStoreUrl();
    Linking.openURL(storeUrl).catch((error) => {
      console.warn('Failed to open store URL', error);
    });
  }, []);

  const handleLater = useCallback(() => {
    if (forceUpdate) {
      return;
    }
    setVisible(false);
  }, [forceUpdate]);

  const evaluateVersion = useCallback(
    (response: VersionResponse) => {
      const platformLatest = getLatestVersionFromResponse(response);
      if (!platformLatest) {
        return;
      }

      if (semverGt(platformLatest, currentVersion)) {
        setLatestVersion(platformLatest);
        setForceUpdate(response.force_update);
        setVisible(true);
      } else {
        setVisible(false);
        setForceUpdate(false);
        setLatestVersion(null);
      }
    },
    [currentVersion]
  );

  const fetchLatestVersion = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch(VERSION_ENDPOINT);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const data = (await response.json()) as VersionResponse;
      console.log('[VersionCheck] Response:', data);
      evaluateVersion(data);
    } catch (error) {
      console.warn('Failed to fetch latest version', error);
    } finally {
      setChecking(false);
    }
  }, [evaluateVersion]);

  useEffect(() => {
    fetchLatestVersion();
  }, [fetchLatestVersion]);

  return {
    visible,
    latestVersion,
    currentVersion,
    forceUpdate,
    checking,
    onUpdate: handleUpdate,
    onLater: handleLater,
    retry: fetchLatestVersion,
  };
};


