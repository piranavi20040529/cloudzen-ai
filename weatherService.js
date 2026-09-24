import { apiRequest } from './apiClient';

export const weatherService = {
  getCurrentWeather: async (lat = 6.9271, lon = 79.8612) => {
    return await apiRequest(`/weather/current?lat=${lat}&lon=${lon}`, 'GET');
  },
};
