import { Schedule } from '../entities/film.entity';

export interface FilmData {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
  schedule: Schedule[];
  createdAt?: Date;
  updatedAt?: Date;
}
