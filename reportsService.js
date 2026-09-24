import { apiRequest } from './apiClient';

export const reportsService = {
  getWeatherBrief: async (lat = 6.9271, lon = 79.8612) => {
    return await apiRequest(`/reports/weather-brief?lat=${lat}&lon=${lon}`, 'GET');
  },
};
