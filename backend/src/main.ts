import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { DevLogger } from './logger/dev.logger';
import { JsonLogger } from './logger/json.logger';
import { TskvLogger } from './logger/tskv.logger';

async function bootstrap() {
  const loggerType = process.env.LOGGER_TYPE || 'dev';
  let logger;
  switch (loggerType) {
    case 'json':
      logger = new JsonLogger();
      break;
    case 'tskv':
      logger = new TskvLogger();
      break;
    default:
      logger = new DevLogger('Bootstrap');
  }
  const app = await NestFactory.create(AppModule, {
    logger: logger,
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);

  // Получаем конфигурацию
  const port = configService.get<number>('server.port');
  const globalPrefix = configService.get<string>('server.globalPrefix');
  const corsOrigin = configService.get<string>('security.corsOrigin');

  // Безопасность - Helmet с кастомными настройками для статических файлов
  app.use((req, res, next) => {
    if (req.path.startsWith('/content/')) {
      next();
    } else {
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', corsOrigin, 'http://localhost:3000'],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          },
        },
      })(req, res, next);
    }
  });

  // Сжатие ответов
  app.use(compression());

  // Валидация запросов
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Глобальный префикс API
  app.setGlobalPrefix(globalPrefix);

  // Swagger документация
  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.get<string>('swagger.title'))
    .setDescription(configService.get<string>('swagger.description'))
    .setVersion(configService.get<string>('swagger.version'))
    .addTag('films', 'Операции с фильмами')
    .addTag('orders', 'Операции с заказами')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(configService.get<string>('swagger.path'), app, document);

  // Запуск сервера
  await app.listen(port);
  logger.log(`Приложение запущено на http://localhost:${port}/${globalPrefix}`);
  logger.log(`Документация API доступна на http://localhost:${port}/api/docs`);
}

bootstrap();
