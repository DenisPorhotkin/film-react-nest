import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import * as path from 'node:path';

import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import configuration from './config/configuration';
import { FilmEntity } from './entities/film.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { OrderEntity } from './entities/order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
    }),

    // Подключение к PostgreSQL через TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [FilmEntity, ScheduleEntity, OrderEntity],
        synchronize: false, // отключаем auto-sync, используем существующую схему
        logging: configService.get('server.environment') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Обслуживание статических файлов
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: path.join(
            process.cwd(),
            configService.get('static.contentPath'),
          ),
          serveRoot: configService.get('static.serveRoot'),
          exclude: ['/api/*'],
        },
      ],
      inject: [ConfigService],
    }),

    // Ограничения запросов
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('security.rateLimitTtl'),
          limit: configService.get('security.rateLimit'),
        },
      ],
      inject: [ConfigService],
    }),

    FilmsModule,
    OrderModule,
  ],
})
export class AppModule {}
