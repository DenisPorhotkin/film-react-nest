import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderSchema } from './entities/order.entity';
import { OrderRepository } from '../repository/order.repository';
import { FilmsModule } from '../films/films.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    FilmsModule, 
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 минута
      limit: 100, // 100 запросов в минуту
    }]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderRepository,
  ],
})
export class OrderModule {}