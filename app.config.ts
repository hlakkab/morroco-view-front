import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Morocco View',
  slug: 'morocco-view',
  version: '1.5.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/adaptive-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.advancedai.moroccoview.travel',
    googleServicesFile: "./google-service.plist",
    config: {
      googleMapsApiKey: process.env.GOOGLE_PLACES_API_KEY,
    },
    infoPlist: {
      NSCameraUsageDescription: "This app uses the camera to scan QR codes and take photos.",
      NSPhotoLibraryUsageDescription: "This app uses the photo library to select QR code images.",
      ITSAppUsesNonExemptEncryption: false
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.moroccoview.app',
    scheme: 'com.moroccoview.app',
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_PLACES_API_KEY,
      }
    }
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    ...config.extra,
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
      },
    ],
    'expo-font',
    'expo-localization',
    'expo-secure-store',
    'expo-web-browser',
    [
      'expo-build-properties',
      {
        android: {
          targetSdkVersion: 36,
          compileSdkVersion: 36,
          enableMinifyInReleaseBuilds: true
        }
      }
    ],
    [
      "@react-native-google-signin/google-signin",
      {
        "iosUrlScheme": "com.googleusercontent.apps.27468884706-1vsc596h0d76qq1grrmstfhjig5cdnjc"
      }
    ]
  ],
  jsEngine: "hermes"
}); 