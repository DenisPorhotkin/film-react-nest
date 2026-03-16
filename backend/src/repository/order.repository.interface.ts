import { OrderStatus } from '../order/order-status.enum';
import { OrderEntity } from '../entities/order.entity';

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

export abstract class OrderRepository {
  abstract create(
    orderData: CreateOrderData,
    filmTitle: string,
    hall: number,
  ): Promise<OrderEntity>;

  abstract cancelOrder(orderId: string): Promise<void>;

  abstract findAll(): Promise<OrderEntity[]>;

  abstract findById(orderId: string): Promise<OrderEntity | null>;

  abstract findBySession(sessionId: string): Promise<OrderEntity[]>;

  abstract updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<OrderEntity | null>;
}
