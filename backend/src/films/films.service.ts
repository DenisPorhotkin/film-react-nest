import { Injectable, NotFoundException  } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository.interface';
import { FilmResponseDto, FilmScheduleListResponseDto, FilmListResponseDto } from './dto/films.dto';
import { FileLoggerService } from '../common/logger/file-logger.service';

@Injectable()
export class FilmsService {
  private readonly nameService = FilmsService.name;
  private readonly logger = new FileLoggerService(this.nameService);
  constructor(
    private readonly filmsRepository: FilmsRepository,
  ) {}

  async findAll(): Promise<FilmListResponseDto> {
    const films = await this.filmsRepository.findAll();
    
    const items =  films.map(film => ({
      id: film.id,
      title: film.title,
      rating: film.rating,
      director: film.director,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
      tags: film.tags || [],
    }));
    return {
    total: items.length,
    items: items
    };    
  }

  async findOne(id: string): Promise<FilmResponseDto> {
    const film = await this.filmsRepository.findById(id);
    
    if (!film) {
      this.logger.warn(`[${this.nameService}] Фильм с ID ${id} не найден`);
      throw new NotFoundException(`Фильм с ID ${id} не найден`);
    }
    
    return {
      id: film.id,
      title: film.title,
      rating: film.rating,
      director: film.director,
      about: film.about,
      description: film.description,
      image: film.image,
      cover: film.cover,
      tags: film.tags || [],
    };
  }

  async findSchedule(id: string): Promise<FilmScheduleListResponseDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      this.logger.warn(`[${this.nameService}] Фильм с ID ${id} не найден`);
      throw new NotFoundException(`Фильм с ID ${id} не найден`);
    }
    
  
    const items = film.schedule?.map(s => ({
      id: s.id,
      daytime: typeof s.daytime === 'string' ? s.daytime : s.daytime.toISOString(),
      hall: String(s.hall),
      rows: s.rows,
      seats: s.seats,
      price: s.price,
      taken: s.taken || [],
    })) || [];

    return {
      total: items.length,
      items: items
    };
}

  async getAvailableSeats(filmId: string, scheduleId: string): Promise<{row: number, seat: number}[]> {
    return this.filmsRepository.getAvailableSeats(filmId, scheduleId);
  }
}