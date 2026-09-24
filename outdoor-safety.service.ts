import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { WeatherService } from '../weather/weather.service.js';
import { OUTDOOR_SAFETY_PROMPT } from '../ai/prompts/outdoor-safety.prompt.js';

@Injectable()
export class OutdoorSafetyService {
  private readonly logger = new Logger(OutdoorSafetyService.name);

  constructor(
    private aiService: AiService,
    private weatherService: WeatherService,
  ) {}

  async getRiskAssessment(lat: number, lon: number, user: any) {
    const weather = await this.weatherService.getCurrentWeather(lat, lon);

    const userContext = `
Weather Conditions:
- City: ${weather.city}, Sri Lanka
- Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed}
- UV Index: ${weather.uvIndex} (${weather.uvLevel})
- Air Quality: ${weather.airQualityIndex} (${weather.airQualityLevel})
- Hourly Forecast: ${weather.hourlyForecast.map((h: any) => `${h.time}: ${h.temp}°C, rain ${h.rainProb}`).join('; ')}

User Profile:
- User Type: ${user.userType}
`;

    const fallback = {
      activities: [
        { id: 'walking', name: 'Walking', icon: 'walk', riskScore: 25, status: 'LOW RISK' },
        { id: 'jogging', name: 'Jogging', icon: 'run', riskScore: 40, status: 'MODERATE' },
        { id: 'cycling', name: 'Cycling', icon: 'bike', riskScore: 55, status: 'HIGH RISK' },
        { id: 'hiking', name: 'Hiking', icon: 'hiking', riskScore: 65, status: 'HIGH RISK' },
        { id: 'swimming', name: 'Beach/Swim', icon: 'swim', riskScore: 50, status: 'MODERATE' },
        { id: 'farming', name: 'Farming', icon: 'sprout', riskScore: 45, status: 'MODERATE' },
      ],
      bestTimeWindow: {
        start: '06:30 AM',
        end: '10:30 AM',
        reason: `Coolest temperatures before the midday heat in ${weather.city}.`,
      },
      checklist: [
        { id: '1', text: 'Carry at least 1.5L of clean drinking water', checked: false },
        { id: '2', text: 'Apply UV protection before stepping outside', checked: false },
        { id: '3', text: 'Pack waterproof casing for phone & wallet', checked: false },
        { id: '4', text: 'Inform family of your planned route', checked: false },
      ],
    };

    return this.aiService.generateJSON(OUTDOOR_SAFETY_PROMPT, userContext, fallback);
  }
}
