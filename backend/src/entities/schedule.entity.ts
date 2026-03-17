import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FilmEntity } from './film.entity';

@Entity('schedules')
export class ScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  daytime: string;

  @Column()
  hall: string;

  @Column('int')
  rows: number;

  @Column('int')
  seats: number;

  @Column('double precision')
  price: number;

  @Column('text')
  taken: string; // строка с занятыми местами, например "3:3,1:4"

  @ManyToOne(() => FilmEntity, (film) => film.schedules)
  @JoinColumn({ name: 'filmId' })
  film: FilmEntity;

  @Column({ name: 'filmId' })
  filmId: string;
}
