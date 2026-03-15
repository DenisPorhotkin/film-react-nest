import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderEntity } from '../entities/order.entity';
import { FilmsModule } from '../films/films.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { OrderRepository } from '../repository/order.repository.interface';
import { TypeOrmOrderRepository } from '../repository/typeorm-order.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    FilmsModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    { provide: OrderRepository, useClass: TypeOrmOrderRepository }, // регистрируем реализацию под токеном абстрактного класса
  ],
})
export class OrderModule {}
