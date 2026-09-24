import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiService } from '../ai/ai.service.js';
import { WeatherService } from '../weather/weather.service.js';
import { ROUTE_RISK_PROMPT } from '../ai/prompts/route-risk.prompt.js';

@Injectable()
export class RouteFinderService {
  private readonly logger = new Logger(RouteFinderService.name);
  private readonly orsApiKey: string;

  constructor(
    private configService: ConfigService,
    private aiService: AiService,
    private weatherService: WeatherService,
  ) {
    this.orsApiKey = this.configService.get<string>(
      'OPENROUTESERVICE_API_KEY',
      '',
    );
  }

  async findRoutes(
    originLat: number,
    originLon: number,
    destLat?: number,
    destLon?: number,
    destination?: string,
    mode?: string,
  ) {
    try {
      // Step 1: Geocode destination if coordinates not provided
      let finalDestLat: number;
      let finalDestLon: number;

      if (destLat != null && destLon != null && !isNaN(destLat) && !isNaN(destLon)) {
        finalDestLat = destLat;
        finalDestLon = destLon;
      } else {
        const geocoded = destination
          ? await this.geocodeDestination(destination)
          : null;
        if (geocoded) {
          finalDestLat = geocoded.lat;
          finalDestLon = geocoded.lon;
        } else {
          // Default to Kandy if geocoding fails
          finalDestLat = 7.2906;
          finalDestLon = 80.6337;
        }
      }

      // Step 2: Get routes from OpenRouteService
      const routes = await this.getOrsRoutes(
        originLat,
        originLon,
        finalDestLat,
        finalDestLon,
        mode,
      );

      // Step 3: Get weather at origin and destination
      const [originWeather, destWeather] = await Promise.all([
        this.weatherService.getCurrentWeather(originLat, originLon),
        this.weatherService.getCurrentWeather(finalDestLat, finalDestLon),
      ]);

      // Step 4: Use AI to evaluate route risk
      const userContext = `
Route Information:
- Origin: ${originWeather.city} (${originLat}, ${originLon})
- Destination: ${destination} (${finalDestLat}, ${finalDestLon})
- Transport Mode: ${mode}
- Number of routes found: ${routes.length}

Route Details:
${routes
  .map(
    (r: any, i: number) =>
      `Route ${i + 1}: Distance ${r.distance}, Duration ${r.duration}, via ${r.summary || 'direct route'}`,
  )
  .join('\n')}

Origin Weather (${originWeather.city}):
- Temperature: ${originWeather.temperature}°C
- Condition: ${originWeather.condition}
- Wind: ${originWeather.windSpeed}
- Rain forecast: ${originWeather.hourlyForecast.map((h: any) => `${h.time}: ${h.rainProb}`).join(', ')}

Destination Weather (${destination}):
- Temperature: ${destWeather.temperature}°C
- Condition: ${destWeather.condition}
- Wind: ${destWeather.windSpeed}
- Rain forecast: ${destWeather.hourlyForecast.map((h: any) => `${h.time}: ${h.rainProb}`).join(', ')}

Country: Sri Lanka
`;

      const fallbackRoutes = routes.map((r: any, i: number) => ({
        id: `route-${i + 1}`,
        title: r.summary || `Route ${i + 1} to ${destination}`,
        distance: r.distance,
        duration: r.duration,
        riskLevel: i === 0 ? 'SAFE' : i === 1 ? 'MODERATE' : 'HAZARDOUS',
        riskScore: i === 0 ? 20 : i === 1 ? 55 : 80,
        riskColor: i === 0 ? '#22C55E' : i === 1 ? '#F59E0B' : '#EF4444',
        weatherOnRoute: `${originWeather.condition} in ${originWeather.city}; ${destWeather.condition} near ${destination}.`,
        highlights: [
          i === 0 ? 'Recommended route' : `Alternative route ${i + 1}`,
          `Distance: ${r.distance}`,
          `Duration: ${r.duration}`,
        ],
        coordinates: {
          origin: { latitude: originLat, longitude: originLon },
          destination: { latitude: finalDestLat, longitude: finalDestLon },
        },
      }));

      return this.aiService.generateJSON(
        ROUTE_RISK_PROMPT,
        userContext,
        fallbackRoutes,
      );
    } catch (error) {
      this.logger.error('Route finder failed', error.message);
      // Return a basic fallback route
      return [
        {
          id: 'route-1',
          title: `Direct Route to ${destination}`,
          distance: 'Unknown',
          duration: 'Unknown',
          riskLevel: 'MODERATE',
          riskScore: 50,
          riskColor: '#F59E0B',
          weatherOnRoute: 'Unable to determine weather conditions on route.',
          highlights: ['Direct route', 'Check local conditions'],
          coordinates: {
            origin: { latitude: originLat, longitude: originLon },
            destination: { latitude: destLat || 7.2906, longitude: destLon || 80.6337 },
          },
        },
      ];
    }
  }

  private async getOrsRoutes(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
    mode?: string,
  ): Promise<any[]> {
    if (!this.orsApiKey) {
      this.logger.warn('OpenRouteService API key not set, returning default routes');
      return this.getDefaultRoutes(originLat, originLon, destLat, destLon);
    }

    try {
      const profileMap: Record<string, string> = {
        drive: 'driving-car',
        walk: 'foot-walking',
        cycle: 'cycling-regular',
      };
      const profile = (mode && profileMap[mode]) || 'driving-car';

      const { data } = await axios.post(
        `https://api.openrouteservice.org/v2/directions/${profile}`,
        {
          coordinates: [
            [originLon, originLat],
            [destLon, destLat],
          ],
          alternative_routes: { target_count: 3 },
        },
        {
          headers: {
            Authorization: this.orsApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      if (!data.routes || data.routes.length === 0) {
        return this.getDefaultRoutes(originLat, originLon, destLat, destLon);
      }

      return data.routes.map((route: any, idx: number) => ({
        distance: `${((route.summary?.distance || 0) / 1000).toFixed(0)} km`,
        duration: this.formatDuration(route.summary?.duration || 0),
        summary: idx === 0 ? 'Primary Highway Route' : `Alternative Route ${idx + 1}`,
      }));
    } catch (error) {
      this.logger.error('ORS routing failed', error.message);
      return this.getDefaultRoutes(originLat, originLon, destLat, destLon);
    }
  }

  private async geocodeDestination(
    place: string,
  ): Promise<{ lat: number; lon: number } | null> {
    try {
      const { data } = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: `${place}, Sri Lanka`,
            format: 'json',
            limit: 1,
          },
          headers: {
            'User-Agent': 'CloudZenAI/1.0',
          },
          timeout: 10000,
        },
      );

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private getDefaultRoutes(
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number,
  ): any[] {
    const dist = this.haversineDistance(
      originLat,
      originLon,
      destLat,
      destLon,
    );
    return [
      {
        distance: `${Math.round(dist)} km`,
        duration: `${Math.round(dist / 50)} hr ${Math.round((dist % 50) * 1.2)} min`,
        summary: 'Primary Route',
      },
      {
        distance: `${Math.round(dist * 1.15)} km`,
        duration: `${Math.round((dist * 1.15) / 45)} hr ${Math.round(((dist * 1.15) % 45) * 1.3)} min`,
        summary: 'Alternative Route',
      },
    ];
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} hr ${minutes} min`;
    return `${minutes} min`;
  }
}
