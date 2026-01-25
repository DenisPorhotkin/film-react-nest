import { Injectable } from '@nestjs/common';
import { FilmsRepository } from './films.repository.interface';
import { FilmData } from '../films/interfaces/film-data.interface';
import { FileLoggerService } from '../common/logger/file-logger.service';

@Injectable()
export class InMemoryFilmsRepository extends FilmsRepository {
  private readonly logger = new FileLoggerService(InMemoryFilmsRepository.name);
  private films: FilmData[] = [];

  constructor() {
    super();
  }

  async findAll(): Promise<FilmData[]> {
    return this.films;
  }

  async findById(id: string): Promise<FilmData | null> {
    return this.films.find((film) => film.id === id) || null;
  }

  async findByScheduleId(scheduleId: string): Promise<FilmData | null> {
    return (
      this.films.find((film) =>
        film.schedule?.some((s) => s.id === scheduleId),
      ) || null
    );
  }

  async reserveSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const film = this.films.find((f) => f.id === filmId);
    if (!film) return false;

    const schedule = film.schedule?.find((s) => s.id === scheduleId);
    if (!schedule) return false;

    const seatKey = `${row}:${seat}`;

    // Проверяем валидность ряда и места
    if (row < 1 || row > schedule.rows || seat < 1 || seat > schedule.seats) {
      return false;
    }

    // Проверяем, не занято ли место
    if (schedule.taken.includes(seatKey)) {
      this.logger.warn(`Ошибка при бронировании места: ${seatKey}`);
      return false;
    }
    schedule.taken.push(seatKey);
    return true;
  }

  async releaseSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const film = this.films.find((f) => f.id === filmId);
    if (!film) return false;

    const schedule = film.schedule?.find((s) => s.id === scheduleId);
    if (!schedule) return false;

    const seatKey = `${row}:${seat}`;

    // Находим индекс seatKey в массиве taken
    const seatIndex = schedule.taken.indexOf(seatKey);
    if (seatIndex === -1) {
      // Место не было забронировано, это не ошибка
      this.logger.warn(`Результат освобождения места: ${seatKey} не найдено`);
      return true;
    }

    // Удаляем seatKey из массива taken
    schedule.taken.splice(seatIndex, 1);
    return true;
  }

  async getAvailableSeats(
    filmId: string,
    scheduleId: string,
  ): Promise<{ row: number; seat: number }[]> {
    const film = this.films.find((f) => f.id === filmId);
    if (!film) {
      this.logger.warn(`Фильм с ID ${filmId} не найден`);
      return [];
    }

    const schedule = film.schedule?.find((s) => s.id === scheduleId);
    if (!schedule) {
      this.logger.warn(`Сеанс с ID ${scheduleId} не найден`);
      return [];
    }

    const availableSeats: { row: number; seat: number }[] = [];
    const takenSet = new Set(schedule.taken);

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
