/**
 * Конфигурация приложения
 * Все переменные окружения централизованно управляются здесь
 */
export default () => ({
  // Конфигурация сервера
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    globalPrefix: process.env.GLOBAL_PREFIX || 'api/afisha',
    environment: process.env.NODE_ENV || 'development',
  },

  // Конфигурация базы данных
  database: {
    driver: process.env.DATABASE_DRIVER || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'prac',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'prac',
  },

  // Конфигурация безопасности
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    rateLimit: parseInt(process.env.RATE_LIMIT || '100', 10),
    rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
  },

  // Конфигурация статических файлов
  static: {
    contentPath: 'public/content/afisha',
    serveRoot: '/content/afisha',
  },

  // Конфигурация Swagger
  swagger: {
    title: 'Afisha API',
    description: 'API для бронирования билетов в кино',
    version: '1.0',
    path: 'api/docs',
  },
});
