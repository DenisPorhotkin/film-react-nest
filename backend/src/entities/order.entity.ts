import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'orderId', type: 'uuid', unique: true })
  orderId: string;

  @Column({ name: 'filmId', type: 'uuid' })
  filmId: string;

  @Column({ name: 'sessionId', type: 'uuid' })
  sessionId: string;

  @Column({ name: 'filmTitle' })
  filmTitle: string;

  @Column({ type: 'timestamp with time zone' })
  daytime: Date;

  @Column('int')
  hall: number;

  @Column('int')
  row: number;

  @Column('int')
  seat: number;

  @Column('double precision')
  price: number;

  @Column({ name: 'seatKey' })
  seatKey: string;

  @Column({ default: 'confirmed' })
  status: string;

  @Column({ name: 'customerEmail', nullable: true })
  customerEmail?: string;

  @Column({ name: 'customerPhone', nullable: true })
  customerPhone?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
