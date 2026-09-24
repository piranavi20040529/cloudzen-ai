import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { AlertsService } from './alerts.service.js';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active disaster alerts for Sri Lanka' })
  @ApiQuery({ name: 'lat', required: false })
  @ApiQuery({ name: 'lon', required: false })
  async getAlerts(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    return this.alertsService.getAlerts(
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
    );
  }
}
