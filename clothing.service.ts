import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { WeatherService } from '../weather/weather.service.js';
import { CLOTHING_PROMPT } from '../ai/prompts/clothing.prompt.js';

@Injectable()
export class ClothingService {
  private readonly logger = new Logger(ClothingService.name);

  constructor(
    private aiService: AiService,
    private weatherService: WeatherService,
  ) {}

  async getRecommendation(lat: number, lon: number, user: any) {
    const weather = await this.weatherService.getCurrentWeather(lat, lon);

    const userContext = `
Weather Conditions:
- City: ${weather.city}, Sri Lanka
- Temperature: ${weather.temperature}°C (Feels like: ${weather.feelsLike}°C)
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind: ${weather.windSpeed}
- UV Index: ${weather.uvIndex} (${weather.uvLevel})
- Rain probability in next hours: ${weather.hourlyForecast.map((h: any) => `${h.time}: ${h.rainProb}`).join(', ')}

User Profile:
- User Type: ${user.userType}
- Location: ${weather.city}
`;

    const fallback = {
      summary: `Lightweight, breathable clothes recommended for ${weather.temperature}°C with ${weather.humidity}% humidity in ${weather.city}.`,
      items: [
        { category: 'Top Wear', recommendation: 'Breathable Light Cotton Shirt / T-Shirt', icon: 'tshirt-crew' },
        { category: 'Bottom Wear', recommendation: 'Lightweight Linen Pants / Shorts', icon: 'human-legs' },
        { category: 'Footwear', recommendation: 'Comfortable Walking Shoes', icon: 'shoe-formal' },
      ],
      accessories: [
        { item: 'Folding Umbrella', icon: 'umbrella', priority: 'Must Have' },
        { item: 'UV400 Sunglasses', icon: 'glasses', priority: 'Recommended' },
        { item: 'Sunscreen SPF 50+', icon: 'bottle-tonic', priority: 'Essential' },
      ],
      proTip: `Humidity is at ${weather.humidity}%. Avoid heavy fabrics that trap heat.`,
    };

    return this.aiService.generateJSON(CLOTHING_PROMPT, userContext, fallback);
  }
}
