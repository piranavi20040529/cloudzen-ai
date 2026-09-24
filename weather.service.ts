import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Map OWM weather condition codes to MaterialCommunityIcons names
const OWM_ICON_MAP: Record<string, string> = {
  '01d': 'weather-sunny',
  '01n': 'weather-night',
  '02d': 'weather-partly-cloudy',
  '02n': 'weather-night-partly-cloudy',
  '03d': 'weather-cloudy',
  '03n': 'weather-cloudy',
  '04d': 'weather-cloudy',
  '04n': 'weather-cloudy',
  '09d': 'weather-pouring',
  '09n': 'weather-pouring',
  '10d': 'weather-rainy',
  '10n': 'weather-rainy',
  '11d': 'weather-lightning-rainy',
  '11n': 'weather-lightning-rainy',
  '13d': 'weather-snowy',
  '13n': 'weather-snowy',
  '50d': 'weather-fog',
  '50n': 'weather-fog',
};

const UV_LEVELS: { max: number; label: string }[] = [
  { max: 2, label: 'Low' },
  { max: 5, label: 'Moderate' },
  { max: 7, label: 'High' },
  { max: 10, label: 'Very High' },
  { max: Infinity, label: 'Extreme' },
];

const AQI_LEVELS: Record<number, string> = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor',
};

interface CacheEntry {
  data: any;
  timestamp: number;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly owmApiKey: string;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(private configService: ConfigService) {
    this.owmApiKey = this.configService.get<string>(
      'OPENWEATHERMAP_API_KEY',
      '',
    );
  }

  async getCurrentWeather(lat: number = 6.9271, lon: number = 79.8612) {
    const validLat = typeof lat === 'number' && !isNaN(lat) ? lat : 6.9271;
    const validLon = typeof lon === 'number' && !isNaN(lon) ? lon : 79.8612;

    const cacheKey = `weather_${validLat.toFixed(2)}_${validLon.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Fetch data from all sources in parallel
      const [owmCurrent, owmForecast, owmAqi, openMeteo] = await Promise.all([
        this.fetchOWMCurrent(validLat, validLon),
        this.fetchOWMForecast(validLat, validLon),
        this.fetchOWMAqi(validLat, validLon),
        this.fetchOpenMeteo(validLat, validLon),
      ]);

      // Map condition icon
      const iconCode = owmCurrent.weather?.[0]?.icon || '01d';
      const conditionIcon =
        OWM_ICON_MAP[iconCode] || 'weather-partly-cloudy';

      // UV level
      const uvIndex = Math.round(openMeteo.uvIndex ?? 0);
      const uvLevel =
        UV_LEVELS.find((l) => uvIndex <= l.max)?.label || 'Unknown';

      // AQI
      const aqiIndex = owmAqi?.list?.[0]?.main?.aqi ?? 1;
      const airQualityIndex = owmAqi?.list?.[0]?.components?.pm2_5
        ? Math.round(owmAqi.list[0].components.pm2_5)
        : aqiIndex * 10;

      // Format sunrise/sunset
      const sunrise = this.formatTime(owmCurrent.sys?.sunrise, owmCurrent.timezone);
      const sunset = this.formatTime(owmCurrent.sys?.sunset, owmCurrent.timezone);

      // Build hourly forecast from Open-Meteo
      const hourlyForecast = this.buildHourlyForecast(openMeteo, owmForecast);

      // Wind direction
      const windDeg = owmCurrent.wind?.deg ?? 0;
      const windDir = this.getWindDirection(windDeg);

      const result = {
        city: owmCurrent.name || 'Unknown',
        district: owmCurrent.name || 'Unknown',
        country: `Sri Lanka 🇱🇰`,
        temperature: Math.round(owmCurrent.main?.temp ?? 0),
        feelsLike: Math.round(owmCurrent.main?.feels_like ?? openMeteo.apparentTemp ?? 0),
        condition: owmCurrent.weather?.[0]?.main || 'Clear',
        conditionIcon,
        humidity: owmCurrent.main?.humidity ?? 0,
        windSpeed: `${Math.round(owmCurrent.wind?.speed ?? 0 * 3.6)} km/h ${windDir}`,
        uvIndex,
        uvLevel,
        airQualityIndex,
        airQualityLevel: AQI_LEVELS[aqiIndex] || 'Good',
        pressure: `${owmCurrent.main?.pressure ?? 1013} hPa`,
        visibility: `${Math.round((owmCurrent.visibility ?? 10000) / 1000)} km`,
        sunrise,
        sunset,
        hourlyForecast,
      };

      // Cache result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch weather data', error.message);
      throw error;
    }
  }

  private async fetchOWMCurrent(lat: number, lon: number) {
    if (!this.owmApiKey) {
      this.logger.warn('OpenWeatherMap API key not set');
      return this.getDefaultCurrentWeather();
    }

    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            appid: this.owmApiKey,
            units: 'metric',
          },
        },
      );
      return data;
    } catch (err) {
      this.logger.warn(`OpenWeatherMap Current API Error (${err.response?.status || err.message}). Using fallback data.`);
      return this.getDefaultCurrentWeather();
    }
  }

  private async fetchOWMForecast(lat: number, lon: number) {
    if (!this.owmApiKey) return { list: [] };

    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat,
            lon,
            appid: this.owmApiKey,
            units: 'metric',
            cnt: 8, // Next 24 hours (3-hour intervals)
          },
        },
      );
      return data;
    } catch (err) {
      this.logger.warn(`OpenWeatherMap Forecast API Error (${err.response?.status || err.message}).`);
      return { list: [] };
    }
  }

  private async fetchOWMAqi(lat: number, lon: number) {
    if (!this.owmApiKey) return { list: [{ main: { aqi: 1 }, components: {} }] };

    try {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution`,
        {
          params: { lat, lon, appid: this.owmApiKey },
        },
      );
      return data;
    } catch {
      return { list: [{ main: { aqi: 1 }, components: {} }] };
    }
  }

  private async fetchOpenMeteo(lat: number, lon: number) {
    try {
      const { data } = await axios.get(
        `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude: lat,
            longitude: lon,
            current:
              'uv_index,apparent_temperature',
            hourly:
              'temperature_2m,weather_code,precipitation_probability,uv_index',
            timezone: 'auto',
            forecast_days: 1,
          },
        },
      );

      return {
        uvIndex: data.current?.uv_index ?? 0,
        apparentTemp: data.current?.apparent_temperature ?? 0,
        hourly: data.hourly || {},
      };
    } catch {
      return { uvIndex: 0, apparentTemp: 0, hourly: {} };
    }
  }

  private buildHourlyForecast(openMeteo: any, owmForecast: any): any[] {
    const hourly = openMeteo.hourly || {};
    const times = hourly.time || [];
    const temps = hourly.temperature_2m || [];
    const weatherCodes = hourly.weather_code || [];
    const rainProbs = hourly.precipitation_probability || [];

    const now = new Date();
    const currentHour = now.getHours();

    // Get next 6 hours from Open-Meteo
    const forecast: any[] = [];
    for (let i = 0; i < times.length && forecast.length < 6; i++) {
      const hour = new Date(times[i]).getHours();
      if (hour >= currentHour || forecast.length > 0) {
        forecast.push({
          time: forecast.length === 0 ? 'Now' : this.formatHour(hour),
          temp: Math.round(temps[i] ?? 0),
          icon: this.weatherCodeToIcon(weatherCodes[i] ?? 0),
          rainProb: `${rainProbs[i] ?? 0}%`,
        });
      }
    }

    // Fallback to OWM forecast if Open-Meteo is empty
    if (forecast.length === 0 && owmForecast.list) {
      for (let i = 0; i < Math.min(6, owmForecast.list.length); i++) {
        const item = owmForecast.list[i];
        const dt = new Date(item.dt * 1000);
        forecast.push({
          time: i === 0 ? 'Now' : this.formatHour(dt.getHours()),
          temp: Math.round(item.main?.temp ?? 0),
          icon: OWM_ICON_MAP[item.weather?.[0]?.icon || '01d'] || 'weather-sunny',
          rainProb: `${Math.round((item.pop ?? 0) * 100)}%`,
        });
      }
    }

    return forecast;
  }

  private weatherCodeToIcon(code: number): string {
    if (code <= 1) return 'weather-sunny';
    if (code <= 3) return 'weather-partly-cloudy';
    if (code <= 48) return 'weather-fog';
    if (code <= 55) return 'weather-rainy';
    if (code <= 65) return 'weather-rainy';
    if (code <= 67) return 'weather-snowy-rainy';
    if (code <= 77) return 'weather-snowy';
    if (code <= 82) return 'weather-pouring';
    if (code <= 86) return 'weather-snowy-heavy';
    if (code <= 99) return 'weather-lightning-rainy';
    return 'weather-partly-cloudy';
  }

  private formatHour(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')} ${period}`;
  }

  private formatTime(unixTimestamp: number, timezoneOffset: number): string {
    if (!unixTimestamp) return '06:00 AM';
    const date = new Date((unixTimestamp + (timezoneOffset || 0)) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  private getWindDirection(deg: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  }

  private getDefaultCurrentWeather() {
    return {
      name: 'Colombo',
      main: { temp: 30, feels_like: 34, humidity: 78, pressure: 1012 },
      weather: [{ main: 'Clouds', icon: '02d' }],
      wind: { speed: 15, deg: 225 },
      visibility: 10000,
      sys: { sunrise: 0, sunset: 0 },
      timezone: 19800,
    };
  }
}
