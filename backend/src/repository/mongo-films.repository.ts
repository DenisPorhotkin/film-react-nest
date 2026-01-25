import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/entities/film.entity';
import { FilmsRepository } from './films.repository.interface';
import { FilmData } from '../films/interfaces/film-data.interface';
import { FileLoggerService } from '../common/logger/file-logger.service';

@Injectable()
export class MongoFilmsRepository extends FilmsRepository {
  private readonly nameService = MongoFilmsRepository.name;
  private readonly logger = new FileLoggerService(this.nameService);

  constructor(@InjectModel(Film.name) private filmModel: Model<Film>) {
    super();
  }

  private toFilmData(film: Film): FilmData {
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags || [],
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule: film.schedule || [],
      createdAt: film.createdAt,
      updatedAt: film.updatedAt,
    };
  }

  async findAll(): Promise<FilmData[]> {
    const films = await this.filmModel.find({}).exec();
    return films.map((film) => this.toFilmData(film));
  }

  async findById(id: string): Promise<FilmData | null> {
    const film = await this.filmModel
      .findOne({ id, isActive: { $ne: false } })
      .exec();
    return film ? this.toFilmData(film) : null;
  }

  async findByScheduleId(scheduleId: string): Promise<FilmData | null> {
    const film = await this.filmModel
      .findOne({
        isActive: { $ne: false },
        'schedule.id': scheduleId,
      })
      .exec();
    return film ? this.toFilmData(film) : null;
  }

  async reserveSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const seatKey = `${row}:${seat}`;

    try {
      const result = await this.filmModel
        .findOneAndUpdate(
          {
            id: filmId,
            schedule: {
              $elemMatch: {
                id: scheduleId,
                taken: { $nin: [seatKey] },
              },
            },
          },
          {
            $addToSet: { 'schedule.$.taken': seatKey },
          },
          { new: true },
        )
        .exec();

      const success = result !== null;
      return success;
    } catch (error) {
      this.logger.error(
        `[${this.nameService}] Ошибка при бронировании места: ${error.message}`,
      );
      return false;
    }
  }

  async releaseSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const seatKey = `${row}:${seat}`;

    try {
      const result = await this.filmModel
        .findOneAndUpdate(
          {
            id: filmId,
            'schedule.id': scheduleId,
          },
          {
            $pull: { 'schedule.$.taken': seatKey },
          },
          { new: true },
        )
        .exec();

      const success = result !== null;
      return success;
    } catch (error) {
      this.logger.error(
        `[${this.nameService}] Ошибка при освобождении места: ${error.message}`,
      );
      return false;
    }
  }

  async getAvailableSeats(
    filmId: string,
    scheduleId: string,
  ): Promise<{ row: number; seat: number }[]> {
    const film = await this.filmModel
      .findOne({
        id: filmId,
        isActive: { $ne: false },
      })
      .exec();

    if (!film) {
      this.logger.warn(`[${this.nameService}] Фильм с ID ${filmId} не найден`);
      return [];
    }

    const schedule = film.schedule.find((s) => s.id === scheduleId);
    if (!schedule) {
      this.logger.warn(
        `[${this.nameService}] Сеанс с ID ${scheduleId} не найден`,
      );
      return [];
    }

    const availableSeats: { row: number; seat: number }[] = [];
    const takenSet = new Set(schedule.taken);

    // Генерация списка всех мест и фильтрация занятых
    for (let row = 1; row <= schedule.rows; row++) {
      for (let seat = 1; seat <= schedule.seats; seat++) {
        const seatKey = `${row}:${seat}`;
        if (!takenSet.has(seatKey)) {
          availableSeats.push({ row, seat });
        }
      }
    }

    return availableSeats;
  }
}
