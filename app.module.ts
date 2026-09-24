import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConfig } from './config/database.config.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { WeatherModule } from './weather/weather.module.js';
import { AlertsModule } from './alerts/alerts.module.js';
import { AiModule } from './ai/ai.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { MailModule } from './mail/mail.module.js';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // PostgreSQL database connection
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // Scheduled tasks (CRON for disaster alert polling)
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute
      },
    ]),

    // Feature modules
    AuthModule,
    UsersModule,
    WeatherModule,
    AlertsModule,
    AiModule,
    ReportsModule,
    RecommendationsModule,
    MailModule,
  ],
})
export class AppModule {}
