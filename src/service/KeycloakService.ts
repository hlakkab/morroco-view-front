import * as SecureStore from 'expo-secure-store';

const KEYCLOAK_URL = `http://34.175.18.109:8080/realms/morocco-view/protocol/openid-connect/token`;
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
    Promise.all([
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
    Promise.all([
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
    return data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

const getAccessToken = async () => {
  try {
    const [accessToken, expiryTime] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(TOKEN_EXPIRY_KEY),
    ]);

    if(!(accessToken && expiryTime)) {
      return null;
    }

    const now = Date.now();
    const expiry = parseInt(expiryTime);

    // Check if token is expired or will expire in the next 10 seconds
    if (now >= expiry - 5000) {
      console.log('Token expired or about to expire');
      await clearTokens();
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    await clearTokens();
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
      throw new Error('No access token available');
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

export { 
  refreshToken, 
  saveTokens, 
  clearTokens, 
  login, 
  getAccessToken, 
  getRefreshToken, 
  getTokenExpiry,
  getUserInfo 
};
