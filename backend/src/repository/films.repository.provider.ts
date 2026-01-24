import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Film } from '../films/entities/film.entity';
import { FilmsRepository } from './films.repository.interface';
import { MongoFilmsRepository } from './mongo-films.repository';
import { InMemoryFilmsRepository } from './in-memory-films.repository';

export const FilmsRepositoryProvider: Provider = {
  provide: FilmsRepository, // Используем абстрактный класс как токен
  useFactory: (
    configService: ConfigService,
    filmModel: any,
  ) => {
    const driver = configService.get<string>('DATABASE_DRIVER', 'memory');
    
    if (driver === 'mongodb') {
      return new MongoFilmsRepository(filmModel);
    } else {
      return new InMemoryFilmsRepository();
    }
  },
  inject: [ConfigService, getModelToken(Film.name)],
};