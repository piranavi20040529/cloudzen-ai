import { apiRequest } from './apiClient';

export const recommendationsService = {
  getClothing: async (lat = 6.9271, lon = 79.8612) => {
    return await apiRequest(`/recommendations/clothing?lat=${lat}&lon=${lon}`, 'GET');
  },

  getOutdoorSafety: async (lat = 6.9271, lon = 79.8612) => {
    return await apiRequest(`/recommendations/outdoor-safety?lat=${lat}&lon=${lon}`, 'GET');
  },

  getRoutes: async (destination, mode = 'drive', originLat = 6.9271, originLon = 79.8612, destLat = null, destLon = null) => {
    return await apiRequest('/recommendations/route-finder', 'POST', {
      originLat,
      originLon,
      destLat,
      destLon,
      destination,
      mode,
    });
  },
};
