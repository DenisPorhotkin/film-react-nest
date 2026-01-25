import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { v4 as uuidv4 } from 'uuid';
import { FileLoggerService } from '../common/logger/file-logger.service';

export interface CreateOrderData {
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
  customerEmail?: string;
  customerPhone?: string;
}

export interface IOrderRepository {
  create(
    orderData: CreateOrderData,
    filmTitle: string,
    hall: number,
  ): Promise<Order>;
  findAll(): Promise<Order[]>;
  findById(orderId: string): Promise<Order | null>;
  findBySession(sessionId: string): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<Order | null>;
  cancelOrder(orderId: string): Promise<void>;
}

@Injectable()
export class OrderRepository implements IOrderRepository {
  private readonly nameService = OrderRepository.name;
  private readonly logger = new FileLoggerService(this.nameService);
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async create(
    orderData: CreateOrderData,
    filmTitle: string,
    hall: number,
  ): Promise<Order> {
    const seatKey = `${orderData.row}:${orderData.seat}`;

    const order = new this.orderModel({
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
    this.logger.log(
      `[${this.nameService}] Добавлен заказ (билет): ${order.orderId}`,
    );
    return order.save();
  }

  async cancelOrder(orderId: string): Promise<void> {
    this.logger.log(`[${this.nameService}] Отмена заказа по ID: ${orderId}`);
    await this.orderModel.deleteOne({ orderId }).exec();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orderModel.findOne({ orderId }).exec();
  }

  async findBySession(sessionId: string): Promise<Order[]> {
    return this.orderModel.find({ sessionId }).exec();
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | null> {
    this.logger.log(
      `[${this.nameService}] Изменён статус заказа: ${orderId} на ${status}`,
    );
    return this.orderModel
      .findOneAndUpdate(
        { orderId },
        {
          status,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }
}
