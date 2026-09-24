import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { WeatherService } from './weather.service.js';
import { WeatherQueryDto } from './dto/weather-query.dto.js';

@ApiTags('Weather')
@ApiBearerAuth()
@Controller('weather')
@UseGuards(JwtAuthGuard)
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current weather + hourly forecast' })
  async getCurrentWeather(@Query() query: WeatherQueryDto) {
    return this.weatherService.getCurrentWeather(
      parseFloat(query.lat),
      parseFloat(query.lon),
    );
  }
}
