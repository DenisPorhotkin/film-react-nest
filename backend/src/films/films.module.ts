import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { FilmEntity } from '../entities/film.entity';
import { ScheduleEntity } from '../entities/schedule.entity';
import { FilmsRepository } from '../repository/films.repository.interface';
import { TypeOrmFilmsRepository } from '../repository/typeorm-films.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FilmEntity, ScheduleEntity])],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    { provide: FilmsRepository, useClass: TypeOrmFilmsRepository },
  ],
  exports: [FilmsService, FilmsRepository],
})
export class FilmsModule {}
