import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { WeatherService } from '../weather/weather.service.js';
import { WEATHER_REPORT_PROMPT } from '../ai/prompts/weather-report.prompt.js';

interface CacheEntry {
  data: any;
  timestamp: number;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    private aiService: AiService,
    private weatherService: WeatherService,
  ) {}

  async getWeatherBrief(lat: number, lon: number, user: any) {
    const cacheKey = `report_${lat.toFixed(2)}_${lon.toFixed(2)}_${user.userType}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Get current weather data
    const weather = await this.weatherService.getCurrentWeather(lat, lon);

    // Build user context for AI
    const now = new Date();
    const timeOfDay =
      now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

    const userContext = `
Current Weather Data:
- City: ${weather.city}
- Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed}
- UV Index: ${weather.uvIndex} (${weather.uvLevel})
- Air Quality: ${weather.airQualityIndex} (${weather.airQualityLevel})
- Sunrise: ${weather.sunrise}, Sunset: ${weather.sunset}
- Hourly Forecast: ${weather.hourlyForecast.map((h: any) => `${h.time}: ${h.temp}°C, rain ${h.rainProb}`).join('; ')}

User Profile:
- Name: ${user.fullName}
- User Type: ${user.userType}
- Health Alert Preferences: ${user.healthAlerts?.join(', ') || 'none'}
- Time of Day: ${timeOfDay}
- Location: ${weather.city}, Sri Lanka
`;

    const fallback = {
      reportId: `rep-${weather.city?.toLowerCase() || 'default'}-001`,
      title: `${weather.city} Weather Intelligence Brief`,
      greeting: `Good ${timeOfDay}, ${user.fullName}!`,
      summary: `Current temperature is ${weather.temperature}°C with ${weather.condition.toLowerCase()} conditions. UV index is ${weather.uvIndex} (${weather.uvLevel}).`,
      riskLevel: weather.uvIndex >= 8 ? 'HIGH' : weather.uvIndex >= 5 ? 'MODERATE' : 'LOW',
      riskColor: weather.uvIndex >= 8 ? '#EF4444' : weather.uvIndex >= 5 ? '#F97316' : '#22C55E',
      personalizedAdvisory: `Stay hydrated and check weather updates regularly.`,
      healthAlerts: [],
      forecastOutlook: `Expect ${weather.condition.toLowerCase()} conditions for the rest of the day.`,
      clothingSuggestion: 'Light, breathable clothing recommended.',
      funFact: 'Sri Lanka experiences two monsoon seasons: Yala (May-Sep) and Maha (Oct-Mar)!',
      generatedAt: `${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} today`,
    };

    const result = await this.aiService.generateJSON(
      WEATHER_REPORT_PROMPT,
      userContext,
      fallback,
    );

    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }
}
