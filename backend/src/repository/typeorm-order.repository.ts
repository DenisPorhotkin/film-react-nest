import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrderEntity } from '../entities/order.entity';
import { OrderRepository, CreateOrderData } from './order.repository.interface';
import { OrderStatus } from '../order/order-status.enum';
import { FileLoggerService } from '../common/logger/file-logger.service';

@Injectable()
export class TypeOrmOrderRepository extends OrderRepository {
  private readonly logger = new FileLoggerService(TypeOrmOrderRepository.name);

  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
  ) {
    super();
  }

  async create(
    orderData: CreateOrderData,
    filmTitle: string,
    hall: number,
  ): Promise<OrderEntity> {
    const seatKey = `${orderData.row}:${orderData.seat}`;

    const order = this.orderRepo.create({
      orderId: uuidv4(),
      filmId: orderData.film,
      sessionId: orderData.session,
      filmTitle,
      daytime: new Date(orderData.daytime),
      hall,
      row: orderData.row,
      seat: orderData.seat,
      price: orderData.price,
      seatKey,
      status: OrderStatus.CONFIRMED,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
    });

    const savedOrder = await this.orderRepo.save(order);
    this.logger.log(`Добавлен заказ: ${savedOrder.orderId}`);
    return savedOrder as unknown as OrderEntity;
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.orderRepo.delete({ orderId });
    this.logger.log(`Заказ ${orderId} удалён (откат)`);
  }

  async findAll(): Promise<OrderEntity[]> {
    const orders = await this.orderRepo.find({ order: { createdAt: 'DESC' } });
    return orders as unknown as OrderEntity[];
  }

  async findById(orderId: string): Promise<OrderEntity | null> {
    const order = await this.orderRepo.findOne({ where: { orderId } });
    return order as unknown as OrderEntity | null;
  }

  async findBySession(sessionId: string): Promise<OrderEntity[]> {
    const orders = await this.orderRepo.find({ where: { sessionId } });
    return orders as unknown as OrderEntity[];
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderEntity | null> {
    await this.orderRepo.update({ orderId }, { status, updatedAt: new Date() });
    const updated = await this.findById(orderId);
    return updated as unknown as OrderEntity | null;
  }
}
