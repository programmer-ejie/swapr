import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DatabaseService } from './database/database.service.js';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SessionGuard } from './session.guard.js';
import { MarketplaceController } from './marketplace.controller.js';
import { MarketplaceService } from './marketplace.service.js';
import { ImagesService } from './images.service.js';
import { databaseOptions } from '../scripts/database-options.mjs';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 240 }]),
    DrizzleModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const connectionString = config.get<string>('DATABASE_URL');
        if (!connectionString) {
          throw new Error(
            'DATABASE_URL is missing. Set it in swapr-backend/.env using Supabase Connect > Session pooler.',
          );
        }
        return {
          drizzle,
          connection: {
            ...databaseOptions(connectionString),
            max: 5,
            connectionTimeoutMillis: 10000,
          },
        };
      },
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'swapr-backend',
    }),
  ],
  controllers: [AppController, AuthController, MarketplaceController],
  providers: [
    AppService,
    DatabaseService,
    AuthService,
    SessionGuard,
    MarketplaceService,
    ImagesService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
