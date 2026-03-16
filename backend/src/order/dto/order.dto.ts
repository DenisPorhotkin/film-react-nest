import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order-status.enum';

// DTO для отдельного билета
export class TicketDto {
  @ApiProperty({
    description: 'ID фильма',
    example: '5b70cb1a-61c9-47b1-b207-31f9e89087ff',
  })
  @IsUUID()
  film: string;

  @ApiProperty({
    description: 'ID сеанса',
    example: '208ec902-8955-4a52-bdc3-a6ff04602ed9',
  })
  @IsUUID()
  session: string;

  @ApiProperty({
    description: 'Дата и время сеанса',
    example: '2024-06-30T18:00:53+03:00',
  })
  @IsDateString()
  daytime: string;

  @ApiProperty({
    description: 'День сеанса',
    example: '30 июня',
  })
  @IsOptional()
  day?: string;

  @ApiProperty({
    description: 'Время сеанса',
    example: '18:00',
  })
  @IsOptional()
  time?: string;

  @ApiProperty({
    description: 'Номер ряда',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  row: number;

  @ApiProperty({
    description: 'Номер места',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  seat: number;

  @ApiProperty({
    description: 'Цена билета',
    example: 350,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;
}

// Основной DTO для создания заказа
export class CreateOrderDto {
  @ApiProperty({
    description: 'Email покупателя',
    example: 'customer@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Телефон покупателя',
    example: '+79991234567',
  })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({
    description: 'Список билетов',
    type: [TicketDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];
}

export class OrderResponseDto {
  @ApiProperty({ description: 'ID заказа' })
  id: string;

  @ApiProperty({ description: 'ID фильма' })
  film: string;

  @ApiProperty({ description: 'ID сеанса' })
  session: string;

  @ApiProperty({ description: 'Ряд' })
  row: number;

  @ApiProperty({ description: 'Место' })
  seat: number;

  @ApiProperty({ description: 'Цена' })
  price: number;

  @ApiProperty({
    description: 'Статус заказа',
    enum: OrderStatus,
    enumName: 'OrderStatus',
  })
  status: OrderStatus;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({
    description: 'Email покупателя',
    required: false,
  })
  customerEmail?: string;

  @ApiProperty({
    description: 'Телефон покупателя',
    required: false,
  })
  customerPhone?: string;
}
// DTO для ответа на запрос
export class OrderListResponseDto {
  @ApiProperty({
    description: 'Общее количество созданных заказов',
    example: 2,
  })
  total: number;

  @ApiProperty({
    description: 'Список созданных заказов',
    type: [OrderResponseDto],
  })
  items: OrderResponseDto[];
}
