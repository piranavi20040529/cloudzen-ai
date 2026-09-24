// For physical device testing, replace localhost with your PC's local IP (e.g., http://192.168.1.5:8000/api/v1)
// For Android Emulator: http://10.0.2.2:8000/api/v1
// For iOS Simulator / Web: http://localhost:8000/api/v1
const API_BASE_URL = 'http://10.104.206.63:8000/api/v1';
const TOKEN_KEY = '@cloudzen_jwt_token';

// Safe storage abstraction for Web and Native
const getItem = async (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const setItem = async (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    console.error('Error saving token', e);
  }
};

const removeItem = async (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing token', e);
  }
};

export const getAuthToken = async () => getItem(TOKEN_KEY);

export const setAuthToken = async (token) => {
  if (token) {
    await setItem(TOKEN_KEY, token);
  } else {
    await removeItem(TOKEN_KEY);
  }
};

export const removeAuthToken = async () => removeItem(TOKEN_KEY);

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.message || result.error || 'API Request Failed';
      throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
    }

    // Un-wrap standard transform interceptor response { success, data, message }
    return result.data !== undefined ? result.data : result;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error.message);
    throw error;
  }
};
