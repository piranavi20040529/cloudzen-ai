import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ReportsService } from './reports.service.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('weather-brief')
  @ApiOperation({ summary: 'Get AI-generated weather intelligence report' })
  async getWeatherBrief(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @CurrentUser() user: User,
  ) {
    return this.reportsService.getWeatherBrief(
      parseFloat(lat),
      parseFloat(lon),
      user,
    );
  }
}
