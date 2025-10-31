import * as SecureStore from 'expo-secure-store';

const KEYCLOAK_URL = `https://agence.mview.ma/auth/realms/morocco-view/protocol/openid-connect/token`;
const API_BASE_URL = 'https://agence.mview.ma/api';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];


const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};


const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};


const refreshToken = async () => {
  if (isRefreshing) {
    // If already refreshing, return a promise that resolves when refreshed
    return new Promise((resolve) => {
      subscribeTokenRefresh((token) => {
        resolve(token);
      });
    });
  }
  
  isRefreshing = true;
  
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    // Create request body for token refresh

    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);
    formData.append('client_id', 'marv-backend');
    
    // Make refresh token request
    const response = await fetch(KEYCLOAK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    const { access_token, refresh_token, expires_in } = data;
    
    // Save the new tokens
    await saveTokens(
      access_token,
      refresh_token || refreshToken, // Use new refresh token if provided, otherwise keep the old one
      expires_in
    );
    
    // Notify subscribers that token has been refreshed
    onTokenRefreshed(access_token);
    
    return access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear tokens on refresh failure
    await clearTokens();
    
    // Notify subscribers of failure
    refreshSubscribers.forEach((callback) => callback(""));
    refreshSubscribers = [];
    
    throw error;
  } finally {
    isRefreshing = false;
  }
};


const saveTokens = async (accessToken: string, refreshToken: string, expiresIn: number) => {
  const expiryTime = Date.now() + expiresIn * 1000;
  
  try {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiryTime.toString()),
    ]);
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
};


const clearTokens = async () => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY),
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing tokens:', error);
    return false;
  }
};


const login = async (email: string, password: string) => {

  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  formData.append('grant_type', 'password');
  formData.append('client_id', 'marv-backend');


  try {
    const response = await fetch(KEYCLOAK_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    

    const data = await response.json();
    const { access_token, refresh_token, expires_in } = data;
    await saveTokens(access_token, refresh_token, expires_in);

    // Verify authentication with the backend
    try {
      await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (verifyError) {
      console.error('Auth verification failed:', verifyError);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

const getAccessToken = async () => {
  try {
    const [accessToken, expiryTime] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(TOKEN_EXPIRY_KEY),
    ]);

    if (!(accessToken && expiryTime)) {
      return null;
    }

    const now = Date.now();
    const expiry = parseInt(expiryTime);

    // Check if token is expired or will expire in the next 5 seconds
    if (now >= expiry - 5000) {
      console.log('⚠️ Token is expired or about to expire');
      return null; // Don't clear tokens here, let the refresh logic handle it
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

const getRefreshToken = async () => { 
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

const getTokenExpiry = async () => {
  return await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
};

const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const getUserInfo = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return {}
    }

    const decodedToken = decodeJWT(accessToken);
    if (!decodedToken) {
      throw new Error('Failed to decode access token');
    }

    return {
      id: decodedToken.sub,
      firstName: decodedToken.given_name || '',
      lastName: decodedToken.family_name || '',
      email: decodedToken.email || '',
      phoneNumber: decodedToken.phone_number || '',
      profilePicture: decodedToken.profile_pic || '',
      createdAt: decodedToken.created_at || new Date().toISOString(),
      updatedAt: decodedToken.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
};

/**
 * Exchange Google authorization code for Keycloak tokens
 * This function sends the Google auth code to your backend,
 * which then exchanges it with Keycloak
 */
const loginWithGoogle = async (googleAuthCode: string) => {
  try {
    console.log('🔄 Exchanging Google auth code for Keycloak tokens...');
    
    // Send to your backend API
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: googleAuthCode,
        provider: 'google'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const { access_token, refresh_token, expires_in, first_name, last_name } = data;
    
    if (!access_token || !refresh_token) {
      throw new Error('Invalid token response from server');
    }

    // Save tokens using existing function
    await saveTokens(access_token, refresh_token, expires_in);

    console.log('✅ Successfully authenticated with Keycloak via Google');

    // Extract user information from the response and token
    const decodedToken = decodeJWT(access_token);
    const userInfo = {
      firstName: first_name || '',
      lastName: last_name || '',
      email: decodedToken?.email || '',
    };
    
    console.log('📋 User Information:');
    console.log('  First Name:', userInfo.firstName);
    console.log('  Last Name:', userInfo.lastName);
    console.log('  Email:', userInfo.email);
    
    // Return both the original data and extracted user info
    return {
      ...data,
      userInfo
    };
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
};

/**
 * Exchange Apple authorization code for Keycloak tokens
 * This function sends the Apple auth code to your backend,
 * which then exchanges it with Keycloak
 */
type AppleOptionalProfile = {
  email?: string;
  givenName?: string;
  familyName?: string;
};

const APPLE_PROFILE_BACKUP_KEY = 'apple_profile_backup';
const APPLE_PROFILE_PENDING_KEY = 'apple_profile_pending';

const persistAppleProfileIfNeeded = async (profile?: AppleOptionalProfile) => {
  try {
    if (!profile) return;
    const hasAny = !!(profile.email || profile.givenName || profile.familyName);
    if (!hasAny) return;
    await SecureStore.setItemAsync(APPLE_PROFILE_BACKUP_KEY, JSON.stringify(profile));
    await SecureStore.setItemAsync(APPLE_PROFILE_PENDING_KEY, 'true');
  } catch (e) {
    console.warn('Failed to persist Apple profile backup');
  }
};

const loadAppleProfileBackup = async (): Promise<AppleOptionalProfile | null> => {
  try {
    const pending = await SecureStore.getItemAsync(APPLE_PROFILE_PENDING_KEY);
    if (pending !== 'true') return null;
    const raw = await SecureStore.getItemAsync(APPLE_PROFILE_BACKUP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

const clearAppleProfileBackup = async () => {
  try {
    await SecureStore.deleteItemAsync(APPLE_PROFILE_BACKUP_KEY);
    await SecureStore.deleteItemAsync(APPLE_PROFILE_PENDING_KEY);
  } catch (e) {
    // ignore
  }
};

const loginWithApple = async (
  appleAuthCode: string,
  identityToken: string,
  optionalProfile?: AppleOptionalProfile
) => {
  try {
    console.log('🔄 Exchanging Apple auth code for Keycloak tokens...');
    
    // Send to your backend API
    const profileBackup = (!optionalProfile || (!optionalProfile.email && !optionalProfile.givenName && !optionalProfile.familyName))
      ? await loadAppleProfileBackup()
      : undefined;

    const response = await fetch(`${API_BASE_URL}/auth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify((() => {
        const payload: any = {
          code: appleAuthCode,
          token: identityToken,
          provider: 'apple',
        };
        // Include profile data only if provided by Apple (first login) or pending backup exists
        const profileToSend = optionalProfile && (optionalProfile.email || optionalProfile.givenName || optionalProfile.familyName)
          ? optionalProfile
          : profileBackup || undefined;
        if (profileToSend?.email) payload.email = profileToSend.email;
        if (profileToSend?.givenName) payload.given_name = profileToSend.givenName;
        if (profileToSend?.familyName) payload.family_name = profileToSend.familyName;
        return payload;
      })()),
    });

    if (!response.ok) {
      // Persist profile data for retry if we have it from Apple now
      await persistAppleProfileIfNeeded(optionalProfile);
      const errorText = await response.text();
      throw new Error(`Apple login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const { access_token, refresh_token, expires_in, first_name, last_name } = data;
    
    if (!access_token || !refresh_token) {
      throw new Error('Invalid token response from server');
    }

    // Save tokens using existing function
    await saveTokens(access_token, refresh_token, expires_in);

    // Clear any pending profile backup after a successful auth
    await clearAppleProfileBackup();

    console.log('✅ Successfully authenticated with Keycloak via Apple');

    // Extract user information from the response and token
    const decodedToken = decodeJWT(access_token);
    const userInfo = {
      firstName: first_name || '',
      lastName: last_name || '',
      email: decodedToken?.email || '',
    };
    
    console.log('📋 User Information:');
    console.log('  First Name:', userInfo.firstName);
    console.log('  Last Name:', userInfo.lastName);
    console.log('  Email:', userInfo.email);
    
    // Return both the original data and extracted user info
    return {
      ...data,
      userInfo
    };
  } catch (error) {
    console.error('Error logging in with Apple:', error);
    throw error;
  }
};

/**
 * Sign out from Google Sign-In
 * This function handles Google signout on the client side
 */
const signOutFromGoogle = async () => {
  try {
    // Lazy load Google Sign-In dependencies
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    
    // Try to sign out from Google
    try {
      await GoogleSignin.signOut();
      console.log('✅ Successfully signed out from Google');
    } catch (signOutError) {
      console.log('No Google user to sign out or sign out failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error signing out from Google:', error);
    // Don't throw error - we want logout to continue even if Google signout fails
    return false;
  }
};

export { 
  refreshToken, 
  saveTokens, 
  clearTokens, 
  login, 
  loginWithGoogle,
  loginWithApple,
  getAccessToken, 
  getRefreshToken, 
  getTokenExpiry,
  getUserInfo,
  signOutFromGoogle
};
