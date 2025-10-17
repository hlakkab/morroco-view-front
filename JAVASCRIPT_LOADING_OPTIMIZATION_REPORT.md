# Morocco View - JavaScript Loading Optimization Report

**Generated:** October 17, 2025  
**Project:** Morocco View (Expo/React Native Travel App)  
**React Native Version:** 0.81.3  
**Expo Version:** 54.0.0

---

## 📋 Executive Summary

This report analyzes the JavaScript loading performance of the Morocco View React Native application and provides a prioritized optimization roadmap. The analysis is based on React Native's official [Optimizing JavaScript Loading](https://reactnative.dev/docs/optimizing-javascript-loading) guide.

### Current State
- ✅ Hermes enabled (Android & iOS)
- ✅ Inline requires enabled in Metro
- ✅ New Architecture enabled
- ⚠️ **Bundle Size:** ~4.74 MB (Android)
- 🔴 **Critical Issue:** All 35+ screens loaded at startup

### Optimization Potential
- **Expected cold start reduction:** 50-60%
- **Expected bundle parse time reduction:** 60-70%
- **Expected memory savings:** 30-50 MB
- **Implementation time:** 1-2 weeks (3 phases)

---

## 🔍 Detailed Analysis

### 1. Runtime & Build Configuration

#### React Native Version
```json
"react-native": "0.81.3"
```

#### Project Type
**Expo Managed Workflow** with development build
- Expo SDK: 54.0.0
- Entry point: `index.ts` → `App.tsx`
- Build system: EAS Build
- Config: `app.config.ts` (TypeScript configuration)

#### Hermes Status

**✅ ENABLED** on both platforms:

**Android:**
```gradle
// android/gradle.properties (line 19)
hermesEnabled=true
```

**iOS:**
```typescript
// app.config.ts (line 71)
jsEngine: "hermes"
```

**Verification:**
- Build output shows `index.android.bundle` (~4.74 MB)
- Hermes compiler command configured in `android/app/build.gradle`
- JSC fallback configured but not active

---

### 2. Current Startup Metrics

#### Bundle Size
- **Android JS Bundle:** 4.74 MB (uncompressed)
- **Estimated breakdown:**
  - Navigation Screens: ~2.0 MB (35 screens)
  - Heavy Dependencies: ~1.5 MB (maps, reanimated, copilot, icons)
  - Redux Store: ~400 KB (12 slices)
  - Translations & Assets: ~300 KB
  - React Navigation: ~300 KB
  - Other Libraries: ~240 KB

#### Startup Flow
1. `index.ts` → Registers root component
2. `App.tsx` → Loads all contexts and navigation
3. `AppNavigator.tsx` → **Imports all 35 screens eagerly**
4. `LaunchScreen.tsx` → First screen rendered

#### First Render Components
```
LaunchScreen → (3s delay) → Onboarding OR Home
```

**Critical Path:**
- Font loading (6 icon families)
- Auth context initialization (network call)
- Language context initialization (AsyncStorage)
- Redux store setup (12 slices)
- Navigation stack creation (35 screens)

---

### 3. Lazy Loading Opportunities

#### 🔴 Critical: All Screens Loaded at Startup

**Location:** `src/navigation/AppNavigator.tsx` (lines 4-55)

**Problem:**
```tsx
// ❌ CURRENT: All screens imported eagerly
import AccountScreen from '../Account/screens/AccountScreen';
import LoginScreen from '../Account/screens/LoginScreen';
import RegisterScreen from '../Account/screens/RegisterScreen';
import ForgotPasswordScreen from '../Account/screens/ForgotPasswordScreen';
import ArtisanDetailScreen from '../Artisan/screens/ArtisanDetailScreen';
import ArtisansScreen from '../Artisan/screens/ArtisansScreen';
// ... 29 more screen imports
```

**Impact:**
- All screen modules evaluated before app renders
- All screen dependencies loaded into memory
- ~2 MB of unnecessary code parsed at startup

#### Screens That Should Be Lazy-Loaded

**Keep at Startup (5 screens):**
- ✅ `LaunchScreen` (initial screen)
- ✅ `OnboardingScreen` (first-time flow)
- ✅ `LoginScreen` (authentication)
- ✅ `RegisterScreen` (authentication)
- ✅ `HomeScreen` (main app entry)

**Lazy Load (30 screens):**
- 🔄 `AccountScreen`
- 🔄 `ForgotPasswordScreen`
- 🔄 `ArtisanDetailScreen`, `ArtisansScreen`
- 🔄 `BookmarkScreen`
- 🔄 `BrokerDetailScreen`, `BrokerListScreen`, `MoneyExchangeScreen`
- 🔄 `EmergencyScreen`
- 🔄 `EntertainmentDetailScreenVo`, `EntertainmentScreen`, `EntertainmentScreenVo`
- 🔄 `ESIMScreen`
- 🔄 `EventDetailScreen`
- 🔄 `ExploreMatchesScreen`
- 🔄 `MonumentDetailScreen`, `MonumentsListScreen`, `MonumentsScreen`
- 🔄 `HotelPickupScreen`, `TransportDetailScreen`
- 🔄 `QRCodesScreen`
- 🔄 `RestaurantDetailScreen`, `RestaurantScreen`
- 🔄 `TicketsScreen`
- 🔄 `AddNewTourDestinationsScreen`, `AddNewTourOrganizeScreen`, `AddNewTourScreen`, `TourMapScreen`, `ToursScreen`

**Expected Savings:** ~1.5-2 MB from critical path

---

### 4. Heavy Dependencies Analysis

#### Dependency Inventory

| Library | Size Estimate | Usage | Load Priority | Lazy-Load? |
|---------|---------------|-------|---------------|------------|
| `react-native-maps` | ~600-800 KB | 4 files (maps) | Low | ✅ Yes |
| `react-native-reanimated` | ~400-500 KB | Animations | High | ⚠️ Partial |
| `react-native-copilot` | ~200-300 KB | 32 files (tours) | Low | ✅ Yes |
| `@expo/vector-icons` (6 fonts) | ~2-3 MB | Global | Medium | ✅ Yes |
| `react-native-vision-camera` | ~300-400 KB | QR scanning | Low | ✅ Yes |
| `react-native-google-places-autocomplete` | ~150-200 KB | Location search | Low | ✅ Yes |
| `lottie-react-native` | ~100-150 KB | Animations | Low | ✅ Yes |
| `react-native-qrcode-svg` | ~50-100 KB | QR generation | Low | ✅ Yes |

#### 🔴 Priority 1: Icon Font Pre-loading

**Location:** `App.tsx` (lines 41-48, 55-63)

**Problem:**
```tsx
const [fontsLoaded, fontError] = useFonts({
  ...Ionicons.font,
  ...AntDesign.font,
  ...MaterialIcons.font,
  ...Feather.font,
  ...MaterialCommunityIcons.font,
  ...FontAwesome.font,
});

// Lines 55-63: Manual asset download BLOCKS app start
const iconFontModules = [
  require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/AntDesign.ttf'),
  // ... 4 more fonts
];
await Promise.all(iconFontModules.map((m) => Asset.fromModule(m).downloadAsync()));
```

**Impact:**
- 2-3 MB downloaded before first render
- Splash screen delayed until all fonts loaded
- Most icons not used on launch screen

**Solution:** Remove manual download, let icons lazy-load

#### 🔴 Priority 2: React Native Copilot

**Location:** Used in 32 screens

**Problem:**
- Large onboarding tour library
- Imported eagerly in `HomeScreen.tsx` (line 4)
- Most users skip tours or see them once

**Solution:** Dynamic import when tour starts

#### 🔴 Priority 3: React Native Maps

**Location:** 4 files
- `src/Pickup/containers/ReservationPopup.tsx`
- `src/components/LocationPickerModal.tsx`
- `src/Tours/screens/TourMapScreen.tsx`

**Impact:**
- 600-800 KB JS + heavy native module
- Not used until user navigates to maps

**Solution:** Dynamic import in map components

---

### 5. Module Side Effects

#### 🟡 Issue 1: Auth Context Network Call

**Location:** `src/contexts/AuthContext.tsx` (lines 73-75)

```tsx
useEffect(() => {
  checkAuth(); // ⚠️ Network call to Keycloak at mount
}, []);
```

**Impact:**
- Network request blocks UI interactivity
- Delays time-to-interactive (TTI)
- Unnecessary for first-time users

**Solution:** Defer until after first render

#### 🟡 Issue 2: Language Context AsyncStorage

**Location:** `src/contexts/LanguageContext.tsx` (lines 28-36)

```tsx
useEffect(() => {
  const init = async () => {
    await initializeI18n(); // ⚠️ AsyncStorage read at startup
    setInitialized(true);
  };
  init();
}, []);
```

**Impact:**
- AsyncStorage read delays initialization
- Blocks rendering with `initialized` flag

**Solution:** Load default language immediately, async-load saved preference

#### 🟡 Issue 3: Translation Dictionary Loading

**Location:** `src/translations/i18n.ts` (lines 16-22)

```tsx
i18n.translations = translations; // ⚠️ Both EN and FR loaded at import
i18n.defaultLocale = 'en';
i18n.fallbacks = true;
```

**Impact:**
- Both English and French dictionaries parsed at startup
- Only one language needed initially

**Solution:** Load only active language, fetch others on-demand

#### 🟡 Issue 4: Redux Store Initialization

**Location:** `src/store/store.ts` (lines 3-16)

```tsx
// All 12 reducers imported synchronously
import artisanReducer from '../Artisan/store/artisanSlice';
import bookmarkReducer from '../Bookmarks/store/bookmarkSlice';
import entertainmentReducer from '../Entertainment/store/entertainmentSlice';
// ... 9 more imports
```

**Impact:**
- All slices loaded even if features not accessed
- Hundreds of action creators parsed at startup

**Solution:** Dynamic reducer injection per feature

---

### 6. Metro Configuration

#### Current Config

**File:** `metro.config.js`

```javascript
const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: { 
        inlineRequires: true, // ✅ ALREADY ENABLED
      },
    }),
  };
  
  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  };

  return config;
})();
```

**Status:** ✅ **Properly configured**
- `inlineRequires: true` enables lazy module loading
- SVG transformer configured correctly
- No additional changes needed for Metro

#### Inline Requires Behavior

With `inlineRequires: true`, Metro transforms:

```javascript
// Before:
import MyComponent from './MyComponent';
function Screen() {
  return <MyComponent />;
}

// After (Metro transformation):
function Screen() {
  const MyComponent = require('./MyComponent');
  return <MyComponent />;
}
```

**Benefit:** Modules only loaded when functions execute
**Limitation:** Doesn't work for top-level imports in navigator

---

### 7. Navigation Architecture

#### Current Structure

**Type:** Single Stack Navigator with 35+ screens

**Location:** `src/navigation/AppNavigator.tsx`

```tsx
<Stack.Navigator initialRouteName="Launch">
  <Stack.Screen name="Launch" component={LaunchScreen} />
  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  <Stack.Screen name="Login" component={LoginScreen} />
  {/* 32 more screens defined here */}
</Stack.Navigator>
```

**Problem:**
- All screens loaded at navigator creation
- No lazy-loading boundaries
- Single-stack architecture prevents code-splitting

#### Recommended Structure

```
RootNavigator
├── AuthStack (lazy)
│   ├── Login
│   ├── Register
│   └── ForgotPassword
├── MainStack
│   ├── Launch
│   ├── Onboarding
│   └── Home
├── ToursStack (lazy)
│   ├── ToursScreen
│   ├── TourMapScreen
│   └── AddNewTourScreen
├── MonumentsStack (lazy)
├── RestaurantStack (lazy)
├── ArtisanStack (lazy)
└── ... (other feature stacks)
```

**Benefit:** Each stack loaded on first navigation

---

### 8. Third-Party Library Dependencies

#### Package.json Analysis

**Total Dependencies:** 55+ packages
**Heavy Packages Identified:**

```json
{
  "@react-navigation/native": "^7.1.18",
  "@react-navigation/native-stack": "^7.2.0",
  "@react-navigation/bottom-tabs": "^7.2.1",
  "@react-navigation/stack": "^7.1.2",
  "@reduxjs/toolkit": "^2.6.1",
  "react-native-maps": "1.20.1",
  "react-native-reanimated": "~4.1.0",
  "react-native-copilot": "^3.3.3",
  "react-native-vision-camera": "^4.6.4",
  "react-native-google-places-autocomplete": "^2.5.7",
  "lottie-react-native": "~7.3.1",
  "@expo/vector-icons": "^15.0.2"
}
```

#### Libraries Safe to Lazy-Load

| Library | Lazy-Load Safe? | Notes |
|---------|-----------------|-------|
| `react-native-maps` | ✅ Yes | No init required |
| `react-native-copilot` | ✅ Yes | No init required |
| `react-native-vision-camera` | ✅ Yes | Load when QR screen opens |
| `lottie-react-native` | ✅ Yes | No global setup |
| `react-native-qrcode-svg` | ✅ Yes | Pure component |
| `react-native-google-places-autocomplete` | ✅ Yes | API key passed as prop |
| `@expo/vector-icons` | ✅ Partial | Fonts can lazy-load |

#### Libraries That Must Load Early

| Library | Reason |
|---------|--------|
| `react-navigation` | Core navigation |
| `react-redux` | Global state |
| `react-native-reanimated` | Animated launch screen |
| `react-native-safe-area-context` | Layout calculation |
| `react-native-gesture-handler` | Touch handling |

---

### 9. Optimization Goals & Constraints

#### Performance Targets

| Metric | Current (Estimated) | Target | Improvement |
|--------|---------------------|--------|-------------|
| **Cold Start Time** | 4-6 seconds | <3 seconds | -33-50% |
| **Time to Interactive** | 5-8 seconds | <4 seconds | -20-50% |
| **JS Parse Time** | 2-3 seconds | <1 second | -50-66% |
| **Memory at Launch** | 200-250 MB | <150 MB | -25-40% |
| **Bundle Size** | 4.74 MB | 1.5-2 MB (critical) | -58-68% |

#### Constraints

**🚫 No-Go Zones (per user preference):**
- No Android native code changes
- All edits must be in TSX/TS files
- Preserve existing features

**✅ Acceptable Changes:**
- TypeScript/TSX code modifications
- Metro config adjustments
- Package.json updates
- Expo config changes

#### Testing Strategy

**Devices:**
- Mid-range Android (recommended: Samsung A-series)
- Low-end Android (minimum SDK 21)
- iOS (iPhone 8+ equivalent)

**Scenarios:**
- Cold start (first launch)
- Warm start (app in background)
- Fresh install vs. returning user

---

### 10. Profiling & Validation Plan

#### Recommended Tools

**Metro Bundle Analyzer:**
```bash
npx react-native-bundle-visualizer
```
- Visualize bundle composition
- Identify large modules
- Track optimization progress

**React DevTools Profiler:**
- Measure component render times
- Identify slow renders
- Track re-render patterns

**Flipper:**
- Network requests timeline
- Performance metrics
- React tree inspection

**Android Profiler:**
- CPU usage
- Memory allocation
- Network activity

**Perfetto (Advanced):**
- System-level tracing
- JS thread activity
- Native module calls

#### Baseline Metrics to Capture

**Before optimization:**
```bash
# 1. Bundle size
npx expo export:embed --platform android
ls -lh dist/index.android.bundle

# 2. Metro stats
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/test.bundle \
  --verbose

# 3. Hermes bytecode size
ls -lh android/app/build/generated/assets/react/release/index.android.bundle
```

**After each phase:**
- Re-run bundle size check
- Test cold start on 3+ devices
- Measure TTI with Chrome DevTools
- Profile memory usage

---

## 🎯 Optimization Roadmap

### Phase 1: Quick Wins (1-2 Days)

**Goal:** Reduce initial bundle by 30-40% with minimal risk

#### Task 1.1: Lazy-Load Secondary Screens

**Effort:** 2-3 hours  
**Risk:** Low  
**Expected Impact:** -40% parse time

**Implementation:**

```tsx
// src/navigation/AppNavigator.tsx

import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// ✅ Keep at startup
import LaunchScreen from '../screens/LaunchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../Account/screens/LoginScreen';
import RegisterScreen from '../Account/screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

// 🔄 Lazy load everything else
const AccountScreen = lazy(() => import('../Account/screens/AccountScreen'));
const ForgotPasswordScreen = lazy(() => import('../Account/screens/ForgotPasswordScreen'));
const ArtisanDetailScreen = lazy(() => import('../Artisan/screens/ArtisanDetailScreen'));
const ArtisansScreen = lazy(() => import('../Artisan/screens/ArtisansScreen'));
// ... (30 more lazy imports)

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#CE1126" />
  </View>
);

export function AppNavigator() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Stack.Navigator initialRouteName="Launch">
        <Stack.Screen name="Launch" component={LaunchScreen} />
        {/* Rest of screens */}
      </Stack.Navigator>
    </Suspense>
  );
}
```

**Testing:**
- Navigate to each screen
- Verify lazy loading works
- Check for console errors

---

#### Task 1.2: Remove Icon Font Pre-loading

**Effort:** 30 minutes  
**Risk:** Low  
**Expected Impact:** -2-3 MB, faster splash

**Implementation:**

```tsx
// App.tsx

// ❌ REMOVE: Manual font loading (lines 41-63)
/*
const [fontsLoaded, fontError] = useFonts({
  ...Ionicons.font,
  ...AntDesign.font,
  ...MaterialIcons.font,
  ...Feather.font,
  ...MaterialCommunityIcons.font,
  ...FontAwesome.font,
});

React.useEffect(() => {
  // Remove this entire useEffect
}, [fontsLoaded, fontError]);
*/

// ✅ ADD: Let icons lazy-load
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <LanguageProvider>
            <AuthProvider>
              <NavigationContainer>
                <SafeNavigationWrapper>
                  <AppNavigator />
                </SafeNavigationWrapper>
                <StatusBar style="auto" />
              </NavigationContainer>
            </AuthProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
```

**Testing:**
- Verify icons still render (may appear slightly delayed)
- Check all screens with heavy icon usage
- Ensure no crashes

---

#### Task 1.3: Lazy-Load React Native Copilot

**Effort:** 1-2 hours  
**Risk:** Low  
**Expected Impact:** -200-300 KB

**Implementation:**

```tsx
// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';

const HomeScreen: React.FC = () => {
  const [CopilotComponents, setCopilotComponents] = useState<any>(null);

  const loadCopilot = async () => {
    const copilot = await import('react-native-copilot');
    setCopilotComponents({
      CopilotProvider: copilot.CopilotProvider,
      CopilotStep: copilot.CopilotStep,
      useCopilot: copilot.useCopilot,
      walkthroughable: copilot.walkthroughable,
    });
  };

  useEffect(() => {
    // Only load copilot when tour is needed
    if (shouldShowTour) {
      loadCopilot();
    }
  }, []);

  if (!CopilotComponents) {
    return <HomeScreenContent />;
  }

  const { CopilotProvider } = CopilotComponents;
  return (
    <CopilotProvider>
      <HomeScreenContent />
    </CopilotProvider>
  );
};
```

**Apply to:** All 32 screens using copilot

**Testing:**
- Verify tour still works when triggered
- Check performance before tour loads

---

#### Phase 1 Validation

**Metrics to measure:**
- Bundle size reduction: Target -30-40%
- Cold start time: Target -1.5-2 seconds
- Memory usage: Target -30-50 MB

**Expected Results:**
```
Before Phase 1:
- Bundle: 4.74 MB
- Cold start: ~5 seconds
- Memory: ~225 MB

After Phase 1:
- Bundle: ~2.8 MB (critical path)
- Cold start: ~3-3.5 seconds
- Memory: ~175 MB
```

---

### Phase 2: Medium Optimization (3-5 Days)

**Goal:** Optimize heavy dependencies and contexts

#### Task 2.1: Lazy-Load React Native Maps

**Effort:** 3-4 hours  
**Risk:** Medium  
**Expected Impact:** -600-800 KB

**Implementation:**

```tsx
// src/components/LocationPickerModal.tsx

import React, { lazy, Suspense } from 'react';
import { ActivityIndicator } from 'react-native';

const MapView = lazy(() => 
  import('react-native-maps').then(module => ({ default: module.default }))
);

const Marker = lazy(() => 
  import('react-native-maps').then(module => ({ default: module.Marker }))
);

export const LocationPickerModal = () => {
  const [showMap, setShowMap] = useState(false);

  return (
    <Modal visible={visible}>
      {showMap ? (
        <Suspense fallback={<ActivityIndicator />}>
          <MapView>
            <Marker />
          </MapView>
        </Suspense>
      ) : (
        <Button onPress={() => setShowMap(true)}>Show Map</Button>
      )}
    </Modal>
  );
};
```

**Apply to:**
- `src/components/LocationPickerModal.tsx`
- `src/Pickup/containers/ReservationPopup.tsx`
- `src/Tours/screens/TourMapScreen.tsx`

---

#### Task 2.2: Defer Auth Context Initialization

**Effort:** 2 hours  
**Risk:** Medium  
**Expected Impact:** -500-1000ms cold start

**Implementation:**

```tsx
// src/contexts/AuthContext.tsx

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const checkAuth = async () => {
    // ... existing code
  };

  useEffect(() => {
    // ✅ Defer auth check to allow first render
    const timer = setTimeout(() => {
      setInitialized(true);
      checkAuth();
    }, 100); // Delay by 100ms to allow first paint

    return () => clearTimeout(timer);
  }, []);

  // Allow rendering before auth check completes
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, checkAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Testing:**
- Verify auth still works
- Check for flash of unauthenticated state
- Ensure protected routes still blocked

---

#### Task 2.3: Optimize Translation Loading

**Effort:** 2-3 hours  
**Risk:** Low  
**Expected Impact:** -100-150 KB

**Implementation:**

```tsx
// src/translations/i18n.ts

// ✅ Load only default language at startup
i18n.translations = { en: require('./en').default };
i18n.defaultLocale = 'en';
i18n.locale = 'en';

// ✅ Async-load other languages
export const loadLanguage = async (lang: string) => {
  if (i18n.translations[lang]) return;
  
  const translations = {
    fr: () => import('./fr'),
    // Add more languages here
  };
  
  if (translations[lang]) {
    const module = await translations[lang]();
    i18n.translations[lang] = module.default;
  }
};

// ✅ Update LanguageContext
export const setLanguage = async (language: string) => {
  await loadLanguage(language);
  i18n.locale = language;
  saveLanguage(language);
  setCurrentLanguage(language);
};
```

---

#### Task 2.4: Code-Split Redux Store

**Effort:** 4-6 hours  
**Risk:** Medium  
**Expected Impact:** -300-400 KB

**Implementation:**

```tsx
// src/store/store.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";

// ✅ Only load core reducers at startup
const staticReducers = {};

const store = configureStore({
  reducer: staticReducers,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({ serializableCheck: false })
});

// ✅ Dynamic reducer injection
export const injectReducer = (key: string, reducer: any) => {
  if (store.asyncReducers && store.asyncReducers[key]) {
    return;
  }
  
  store.asyncReducers = store.asyncReducers || {};
  store.asyncReducers[key] = reducer;
  
  store.replaceReducer(combineReducers({
    ...staticReducers,
    ...store.asyncReducers,
  }));
};

export default store;
```

**Usage in feature screens:**

```tsx
// src/Tours/screens/ToursScreen.tsx

import { useEffect } from 'react';
import { injectReducer } from '../../store/store';

const ToursScreen = () => {
  useEffect(() => {
    // Lazy-load tour reducer when screen mounts
    import('../store/tourSlice').then(module => {
      injectReducer('tour', module.default);
    });
  }, []);
  
  // ... rest of component
};
```

---

#### Phase 2 Validation

**Expected Results:**
```
Before Phase 2:
- Bundle: ~2.8 MB (from Phase 1)
- Cold start: ~3-3.5 seconds
- Memory: ~175 MB

After Phase 2:
- Bundle: ~1.8 MB (critical path)
- Cold start: ~2-2.5 seconds
- Memory: ~140 MB
```

---

### Phase 3: Advanced (1-2 Weeks)

**Goal:** Route-level splitting and deep optimization

#### Task 3.1: Restructure Navigation

**Effort:** 3-5 days  
**Risk:** High  
**Expected Impact:** -50-60% parse time

**Implementation:**

```tsx
// src/navigation/AppNavigator.tsx

import React, { lazy } from 'react';

// ✅ Core screens only
import LaunchScreen from '../screens/LaunchScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';

// ✅ Lazy-load feature stacks
const AuthStack = lazy(() => import('./stacks/AuthStack'));
const ToursStack = lazy(() => import('./stacks/ToursStack'));
const MonumentsStack = lazy(() => import('./stacks/MonumentsStack'));
const RestaurantStack = lazy(() => import('./stacks/RestaurantStack'));
const ArtisanStack = lazy(() => import('./stacks/ArtisanStack'));
// ... other stacks

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Launch">
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Lazy-loaded stacks */}
      <Stack.Group>
        {AuthStack}
        {ToursStack}
        {MonumentsStack}
        {RestaurantStack}
        {ArtisanStack}
      </Stack.Group>
    </Stack.Navigator>
  );
}
```

**Create stack files:**

```tsx
// src/navigation/stacks/ToursStack.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const ToursScreen = lazy(() => import('../../Tours/screens/ToursScreen'));
const TourMapScreen = lazy(() => import('../../Tours/screens/TourMapScreen'));
const AddNewTourScreen = lazy(() => import('../../Tours/screens/AddNewTourScreen'));

const Stack = createNativeStackNavigator();

export default function ToursStack() {
  return (
    <>
      <Stack.Screen name="Tours" component={ToursScreen} />
      <Stack.Screen name="TourMapScreen" component={TourMapScreen} />
      <Stack.Screen name="AddNewTour" component={AddNewTourScreen} />
    </>
  );
}
```

---

#### Task 3.2: Optimize Asset Loading

**Effort:** 2-3 days  
**Risk:** Medium  
**Expected Impact:** Variable

**Implementation:**

```tsx
// src/utils/lazyImage.ts

export const preloadImages = (images: any[]) => {
  return Promise.all(
    images.map(img => Asset.fromModule(img).downloadAsync())
  );
};

// Use in screens:
useEffect(() => {
  preloadImages([
    require('../assets/image1.jpg'),
    require('../assets/image2.jpg'),
  ]);
}, []);
```

---

#### Task 3.3: Profile and Fine-Tune

**Effort:** Ongoing  
**Risk:** Low  
**Expected Impact:** Continuous improvement

**Steps:**

1. **Run Bundle Visualizer:**
   ```bash
   npx react-native-bundle-visualizer
   ```

2. **Profile with Flipper:**
   - Enable React DevTools plugin
   - Record startup performance
   - Identify bottlenecks

3. **Test on Real Devices:**
   - Low-end Android (< 4GB RAM)
   - Mid-range Android
   - iOS devices

4. **A/B Test Changes:**
   - Keep metrics for each phase
   - Rollback if performance degrades

---

#### Phase 3 Validation

**Final Expected Results:**
```
Before All Phases:
- Bundle: 4.74 MB
- Cold start: ~5 seconds
- Memory: ~225 MB
- TTI: ~6-8 seconds

After All Phases:
- Bundle: ~1.5 MB (critical path)
- Cold start: ~2-2.5 seconds
- Memory: ~130-140 MB
- TTI: ~3-4 seconds
```

**Achievement:**
- ✅ 50-60% faster cold start
- ✅ 68% smaller critical bundle
- ✅ 38% lower memory usage
- ✅ 50% faster time-to-interactive

---

## 📊 Risk Assessment

### Phase 1 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Lazy-loaded screens fail | Low | High | Thorough testing, error boundaries |
| Icons appear delayed | Medium | Low | Expected behavior, educate users |
| Copilot breaks | Low | Medium | Fallback to non-tour experience |

### Phase 2 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Maps don't load | Low | High | Test on slow networks |
| Auth state flash | Medium | Medium | Adjust delay timing |
| Translation missing | Low | High | Fallback to default language |
| Redux state loss | Low | High | Test reducer injection thoroughly |

### Phase 3 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Navigation breaks | Medium | Critical | Extensive testing, phased rollout |
| Deep linking fails | Medium | High | Update navigation config |
| Performance regression | Low | High | Continuous profiling |

---

## ✅ Success Criteria

### Technical Metrics

- ✅ Bundle size < 2 MB (critical path)
- ✅ Cold start < 3 seconds on mid-range Android
- ✅ TTI < 4 seconds
- ✅ Memory usage < 150 MB at launch
- ✅ No crashes introduced
- ✅ All features still functional

### User Experience Metrics

- ✅ Faster perceived startup time
- ✅ Smoother animations during launch
- ✅ No noticeable delays when navigating
- ✅ Icons appear quickly enough (< 500ms)

### Development Metrics

- ✅ Code maintainability preserved
- ✅ Build times unchanged or improved
- ✅ Hot reload still works
- ✅ TypeScript types still valid

---

## 🔧 Tooling & Commands

### Bundle Analysis

```bash
# Visualize bundle composition
npx react-native-bundle-visualizer

# Generate bundle stats
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js \
  --sourcemap-output /tmp/bundle.map \
  --verbose

# Check bundle size
ls -lh android/app/build/generated/assets/react/release/
```

### Performance Testing

```bash
# Build release APK
npx expo build:android --type apk

# Install and test
adb install app-release.apk
adb shell am start -W -n com.moroccoview.app/.MainActivity

# Profile with systrace
npx react-native run-android --variant=release
adb shell atrace --async_start gfx input view webview
```

### Metro Stats

```bash
# Clear cache
npx expo start --clear

# Bundle with stats
EXPO_BUNDLE_ANALYZER=true npx expo export

# Dev mode with profiling
npx expo start --dev-client --profile
```

---

## 📚 References

### Official Documentation

- [React Native: Optimizing JavaScript Loading](https://reactnative.dev/docs/optimizing-javascript-loading)
- [React Native: Performance](https://reactnative.dev/docs/performance)
- [Expo: App Performance](https://docs.expo.dev/guides/performance/)
- [Hermes Engine](https://hermesengine.dev/)
- [Metro Bundler Configuration](https://facebook.github.io/metro/docs/configuration)

### Tools

- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [Flipper](https://fbflipper.com/)
- [React Native Bundle Visualizer](https://github.com/IjzerenHein/react-native-bundle-visualizer)
- [Perfetto](https://ui.perfetto.dev/)

---

## 📝 Changelog

| Date | Phase | Changes | Impact |
|------|-------|---------|--------|
| TBD | Phase 1 | Lazy-load screens, remove font preload | -40% parse time |
| TBD | Phase 2 | Optimize contexts, split Redux | -60% total |
| TBD | Phase 3 | Navigation restructure | -68% critical bundle |

---

## 👥 Stakeholders

- **Development Team:** Implementation and testing
- **QA Team:** Validation and regression testing
- **DevOps:** Build pipeline adjustments if needed
- **Product:** User experience validation

---

## 🎬 Next Steps

1. **Review this report** with the development team
2. **Baseline current performance** using profiling tools
3. **Begin Phase 1 implementation** (1-2 days)
4. **Measure and validate** Phase 1 results
5. **Proceed to Phase 2** if Phase 1 successful
6. **Continuous monitoring** throughout implementation

---

## 📞 Support

For questions or issues during implementation:
- Review React Native official optimization guide
- Check Expo documentation for build-specific issues
- Profile with recommended tools before and after changes
- Test on multiple devices and OS versions

---

**End of Report**

*Generated by AI Code Analysis - October 17, 2025*

