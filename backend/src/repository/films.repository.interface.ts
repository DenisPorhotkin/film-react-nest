import { FilmData } from '../films/interfaces/film-data.interface';

export interface IFilmsRepository {
  findAll(): Promise<FilmData[]>;
  findById(id: string): Promise<FilmData | null>;
  findByScheduleId(scheduleId: string): Promise<FilmData | null>;
  reserveSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean>;
  releaseSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean>;
  getAvailableSeats(
    filmId: string,
    scheduleId: string,
  ): Promise<{ row: number; seat: number }[]>;
}

export abstract class FilmsRepository implements IFilmsRepository {
  abstract findAll(): Promise<FilmData[]>;
  abstract findById(id: string): Promise<FilmData | null>;
  abstract findByScheduleId(scheduleId: string): Promise<FilmData | null>;
  abstract reserveSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean>;
  abstract releaseSeat(
    filmId: string,
    scheduleId: string,
    row: number,
    seat: number,
  ): Promise<boolean>;
  abstract getAvailableSeats(
    filmId: string,
    scheduleId: string,
  ): Promise<{ row: number; seat: number }[]>;
}
