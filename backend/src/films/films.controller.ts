import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  FilmResponseDto,
  FilmScheduleListResponseDto,
  FilmListResponseDto,
} from './dto/films.dto';

@ApiTags('films')
@Controller('films')
@UseInterceptors(ClassSerializerInterceptor)
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список всех фильмов',
    description: 'Возвращает список фильмов с основной информацией',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список фильмов',
    type: FilmListResponseDto,
  })
  async findAll() {
    return this.filmsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о фильме',
    description: 'Возвращает подробную информацию о фильме по его ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID фильма',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Информация о фильме',
    type: FilmResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Фильм не найден',
  })
  async findOne(@Param('id') id: string) {
    return this.filmsService.findOne(id);
  }

  @Get(':id/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Получить расписание сеансов фильма',
    description: 'Возвращает расписание сеансов для указанного фильма',
  })
  @ApiParam({
    name: 'id',
    description: 'ID фильма',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Расписание сеансов',
    type: FilmScheduleListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Фильм не найден',
  })
  async findSchedule(@Param('id') id: string) {
    return this.filmsService.findSchedule(id);
  }

  @Get(':filmId/seats/:scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Получить список свободных мест',
    description: 'Возвращает список свободных мест для указанного сеанса',
  })
  @ApiParam({
    name: 'filmId',
    description: 'ID фильма',
    type: String,
  })
  @ApiParam({
    name: 'scheduleId',
    description: 'ID сеанса',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список свободных мест',
  })
  async getAvailableSeats(
    @Param('filmId') filmId: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.filmsService.getAvailableSeats(filmId, scheduleId);
  }
}
