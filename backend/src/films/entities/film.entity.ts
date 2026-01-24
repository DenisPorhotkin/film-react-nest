import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class Schedule {
  @ApiProperty()
  @Prop({ required: true })
  id: string;

  @ApiProperty()
  @Prop({ required: true })
  daytime: Date;

  @ApiProperty()
  @Prop({ required: true })
  hall: number;

  @ApiProperty()
  @Prop({ required: true })
  rows: number;

  @ApiProperty()
  @Prop({ required: true })
  seats: number;

  @ApiProperty()
  @Prop({ required: true })
  price: number;

  @ApiProperty()
  @Prop({ type: [String], default: [] })
  taken: string[];
}

@Schema({ timestamps: false })
export class Film extends Document {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  id: string;

  @ApiProperty()
  @Prop({ required: true })
  rating: number;

  @ApiProperty()
  @Prop({ required: true })
  director: string;

  @ApiProperty()
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty()
  @Prop({ required: true })
  image: string;

  @ApiProperty()
  @Prop({ required: true })
  cover: string;

  @ApiProperty()
  @Prop({ required: true })
  title: string;

  @ApiProperty()
  @Prop({ required: true })
  about: string;

  @ApiProperty()
  @Prop({ required: true })
  description: string;

  @ApiProperty()
  @Prop({ type: [Schedule], default: [] })
  schedule: Schedule[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const FilmSchema = SchemaFactory.createForClass(Film);