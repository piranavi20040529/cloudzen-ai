import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RecommendationsController } from './recommendations.controller.js';
import { ClothingService } from './clothing.service.js';
import { OutdoorSafetyService } from './outdoor-safety.service.js';
import { RouteFinderService } from './route-finder.service.js';
import { AiModule } from '../ai/ai.module.js';
import { WeatherModule } from '../weather/weather.module.js';

@Module({
  imports: [ConfigModule, AiModule, WeatherModule],
  controllers: [RecommendationsController],
  providers: [ClothingService, OutdoorSafetyService, RouteFinderService],
})
export class RecommendationsModule {}
