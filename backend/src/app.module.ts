import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import * as path from 'node:path';

import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';
import configuration from './config/configuration';

@Module({
  imports: [
    // Конфигурация приложения
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
    }),

    // Подключение к MongoDB (только если драйвер = mongodb)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const driver = configService.get<string>('database.driver');
        if (driver !== 'mongodb') {
          return null; // Не подключаем Mongoose при использовании in-memory
        }

        const databaseUrl = configService.get<string>('database.url');
        return {
          uri: databaseUrl,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          retryAttempts: 3,
          retryDelay: 1000,
        };
      },
      inject: [ConfigService],
    }),

    // Обслуживание статических файлов
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const contentPath = configService.get<string>('static.contentPath');
        const serveRoot = configService.get<string>('static.serveRoot');

        return [
          {
            rootPath: path.join(process.cwd(), contentPath),
            serveRoot: serveRoot,
            exclude: ['/api/*'],
          },
        ];
      },
      inject: [ConfigService],
    }),

    // Ограничения запросов для безопасности
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('security.rateLimitTtl'),
          limit: configService.get<number>('security.rateLimit'),
        },
      ],
      inject: [ConfigService],
    }),

    // Модули приложения
    FilmsModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
