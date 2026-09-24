import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { AiModule } from '../ai/ai.module.js';
import { WeatherModule } from '../weather/weather.module.js';

@Module({
  imports: [AiModule, WeatherModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
