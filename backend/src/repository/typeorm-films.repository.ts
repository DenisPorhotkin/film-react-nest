import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FilmsRepository } from './films.repository.interface';
import { FilmData } from '../films/interfaces/film-data.interface';
import { FilmEntity } from '../entities/film.entity';
import { ScheduleEntity } from '../entities/schedule.entity';
import { FileLoggerService } from '../common/logger/file-logger.service';

@Injectable()
export class TypeOrmFilmsRepository extends FilmsRepository {
  private readonly logger = new FileLoggerService(TypeOrmFilmsRepository.name);

  constructor(
    @InjectRepository(FilmEntity)
    private filmRepo: Repository<FilmEntity>,
    @InjectRepository(ScheduleEntity)
    private scheduleRepo: Repository<ScheduleEntity>,
    private dataSource: DataSource,
  ) {
    super();
  }

  // Преобразование сущности FilmEntity в FilmData (для сервисов)
  private toFilmData(film: FilmEntity): FilmData {
    const sortedSchedules = film.schedules
      ? [...film.schedules].sort(
          (a, b) =>
            new Date(a.daytime).getTime() - new Date(b.daytime).getTime(),
        )
      : [];
    return {
      id: film.id,
      rating: film.rating,
      director: film.director,
      tags: film.tags ? film.tags.split(',').map((t) => t.trim()) : [],
      image: film.image,
      cover: film.cover,
      title: film.title,
      about: film.about,
      description: film.description,
      schedule:
        sortedSchedules.map((s) => ({
          id: s.id,
          daytime: new Date(s.daytime),
          hall: parseInt(s.hall, 10) || 0, // преобразуем строку в число для совместимости
          rows: s.rows,
          seats: s.seats,
          price: s.price,
          taken: s.taken ? s.taken.split(',').filter((t) => t) : [],
        })) || [],
    };
  }

  async findAll(): Promise<FilmData[]> {
    const films = await this.filmRepo.find({ relations: ['schedules'] });
    return films.map((f) => this.toFilmData(f));
  }

  async findById(id: string): Promise<FilmData | null> {
    const film = await this.filmRepo.findOne({
      where: { id },
      relations: ['schedules'],
    });
    return film ? this.toFilmData(film) : null;
  }

  async findByScheduleId(scheduleId: string): Promise<FilmData | null> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId },
      relations: ['film', 'film.schedules'],
    });
    return schedule?.film ? this.toFilmData(schedule.film) : null;
  }

  async reserveSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const seatKey = `${row}:${seat}`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Блокируем запись о сеансе для избежания конкурентных изменений
      const schedule = await queryRunner.manager
        .createQueryBuilder(ScheduleEntity, 's')
        .setLock('pessimistic_write')
        .where('s.id = :id', { id: scheduleId })
        .getOne();

      if (!schedule) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      // Проверяем, не занято ли место
      const takenArray = schedule.taken
        ? schedule.taken.split(',').filter((t) => t)
        : [];
      if (takenArray.includes(seatKey)) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      // Добавляем место
      takenArray.push(seatKey);
      schedule.taken = takenArray.join(',');

      await queryRunner.manager.save(schedule);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Ошибка при бронировании места: ${error.message}`);
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean> {
    const seatKey = `${row}:${seat}`;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schedule = await queryRunner.manager
        .createQueryBuilder(ScheduleEntity, 's')
        .setLock('pessimistic_write')
        .where('s.id = :id', { id: scheduleId })
        .getOne();

      if (!schedule) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      const takenArray = schedule.taken
        ? schedule.taken.split(',').filter((t) => t)
        : [];
      const index = takenArray.indexOf(seatKey);
      if (index === -1) {
        // Место не было занято – считаем успехом
        await queryRunner.commitTransaction();
        return true;
      }

      takenArray.splice(index, 1);
      schedule.taken = takenArray.join(',');

      await queryRunner.manager.save(schedule);
      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Ошибка при освобождении места: ${error.message}`);
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  async getAvailableSeats(
    filmId: string,
    scheduleId: string,
  ): Promise<{ row: number; seat: number }[]> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id: scheduleId, filmId },
    });
    if (!schedule) {
      this.logger.warn(`Сеанс с ID ${scheduleId} не найден`);
      return [];
    }

    const takenSet = new Set(
      schedule.taken ? schedule.taken.split(',').filter((t) => t) : [],
    );
    const available: { row: number; seat: number }[] = [];

    for (let r = 1; r <= schedule.rows; r++) {
      for (let s = 1; s <= schedule.seats; s++) {
        if (!takenSet.has(`${r}:${s}`)) {
          available.push({ row: r, seat: s });
        }
      }
    }
    return available;
  }
}
