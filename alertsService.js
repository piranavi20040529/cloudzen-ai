import { apiRequest } from './apiClient';

export const alertsService = {
  getAlerts: async (lat = 6.9271, lon = 79.8612) => {
    return await apiRequest(`/alerts?lat=${lat}&lon=${lon}`, 'GET');
  },
};
