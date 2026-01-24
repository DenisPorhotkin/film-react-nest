import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { Film, FilmSchema } from './entities/film.entity';
import { FilmsRepositoryProvider } from '../repository/films.repository.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    FilmsRepositoryProvider, // Используем провайдер
  ],
  exports: [
    FilmsService,
    FilmsRepositoryProvider, // Экспортируем для использования в OrderModule
  ],
})
export class FilmsModule {}