import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Order extends Document {
  @ApiProperty()
  @Prop({ required: true })
  orderId: string;

  @ApiProperty()
  @Prop({ required: true })
  filmId: string;

  @ApiProperty()
  @Prop({ required: true })
  sessionId: string;

  @ApiProperty()
  @Prop({ required: true })
  filmTitle: string;

  @ApiProperty()
  @Prop({ required: true })
  daytime: Date;

  @ApiProperty()
  @Prop({ required: true })
  hall: number;

  @ApiProperty()
  @Prop({ required: true })
  row: number;

  @ApiProperty()
  @Prop({ required: true })
  seat: number;

  @ApiProperty()
  @Prop({ required: true })
  price: number;

  @ApiProperty()
  @Prop({ required: true })
  seatKey: string;

  @ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CONFIRMED,
  })
  status: OrderStatus;

  @ApiProperty()
  @Prop()
  customerEmail?: string;

  @ApiProperty()
  @Prop()
  customerPhone?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
