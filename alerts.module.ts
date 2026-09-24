import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsController } from './alerts.controller.js';
import { AlertsService } from './alerts.service.js';
import { DisasterAlert } from './entities/disaster-alert.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([DisasterAlert])],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
