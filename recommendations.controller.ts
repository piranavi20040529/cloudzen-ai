import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ClothingService } from './clothing.service.js';
import { OutdoorSafetyService } from './outdoor-safety.service.js';
import { RouteFinderService } from './route-finder.service.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly clothingService: ClothingService,
    private readonly outdoorSafetyService: OutdoorSafetyService,
    private readonly routeFinderService: RouteFinderService,
  ) {}

  @Get('clothing')
  @ApiOperation({ summary: 'Get AI smart clothing recommendations' })
  async getClothing(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @CurrentUser() user: User,
  ) {
    return this.clothingService.getRecommendation(
      parseFloat(lat),
      parseFloat(lon),
      user,
    );
  }

  @Get('outdoor-safety')
  @ApiOperation({ summary: 'Get outdoor activity risk assessment' })
  async getOutdoorSafety(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @CurrentUser() user: User,
  ) {
    return this.outdoorSafetyService.getRiskAssessment(
      parseFloat(lat),
      parseFloat(lon),
      user,
    );
  }

  @Post('route-finder')
  @ApiOperation({ summary: 'Get weather-aware route analysis' })
  async findRoutes(
    @Body()
    body: {
      originLat: number;
      originLon: number;
      destLat?: number;
      destLon?: number;
      destination: string;
      mode: string;
    },
  ) {
    return this.routeFinderService.findRoutes(
      body.originLat,
      body.originLon,
      body.destLat,
      body.destLon,
      body.destination,
      body.mode,
    );
  }
}
