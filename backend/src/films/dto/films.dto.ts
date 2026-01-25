import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  IsUUID,
  IsDateString,
  IsPositive,
  Min,
} from 'class-validator';

// Только для расписания
export class ScheduleDto {
  @ApiProperty({
    description: 'ID сеанса',
    example: '793009d6-030c-4dd4-8d13-9ba500724b38',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Дата и время сеанса',
    example: '2024-06-28T10:00:53+03:00',
  })
  @IsDateString()
  daytime: string;

  @ApiProperty({ description: 'Номер зала', example: '0', type: String })
  @IsString()
  hall: string;

  @ApiProperty({ description: 'Количество рядов', example: 5, minimum: 1 })
  @IsNumber()
  @IsPositive()
  rows: number;

  @ApiProperty({
    description: 'Количество мест в ряду',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  seats: number;

  @ApiProperty({ description: 'Цена билета', example: 350, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Занятые места в формате "ряд:место"',
    example: ['3:3', '1:4'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  taken: string[];
}

// Для ответа при получении списка фильмов
export class FilmResponseDto {
  @ApiProperty({ description: 'ID фильма' })
  id: string;

  @ApiProperty({ description: 'Название фильма' })
  title: string;

  @ApiProperty({ description: 'Рейтинг' })
  rating: number;

  @ApiProperty({ description: 'Режиссер' })
  director: string;

  @ApiProperty({ description: 'Краткое описание' })
  about: string;

  @ApiProperty({ description: 'Полное описание' })
  description: string;

  @ApiProperty({ description: 'Путь к изображению' })
  image: string;

  @ApiProperty({ description: 'Путь к фоновому изображению' })
  cover: string;

  @ApiProperty({ description: 'Теги' })
  tags: string[];
}

// Для ответа при получении расписания фильма
export class FilmScheduleResponseDto {
  @ApiProperty({ description: 'ID фильма' })
  filmId: string;

  @ApiProperty({ description: 'Название фильма' })
  title: string;

  @ApiProperty({ description: 'Расписание', type: [ScheduleDto] })
  schedule: ScheduleDto[];
}

export class FilmListResponseDto {
  @ApiProperty({ description: 'Общее количество фильмов', example: 51 })
  total: number;

  @ApiProperty({ description: 'Список фильмов', type: [FilmResponseDto] })
  items: FilmResponseDto[];
}

export class FilmScheduleListResponseDto {
  @ApiProperty({ description: 'Общее количество сеансов', example: 9 })
  total: number;

  @ApiProperty({ description: 'Список сеансов', type: [ScheduleDto] })
  items: ScheduleDto[];
}
