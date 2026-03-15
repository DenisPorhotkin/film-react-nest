import { Order, OrderStatus } from '../order/entities/order.entity';

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
  ): Promise<Order>;

  abstract cancelOrder(orderId: string): Promise<void>;

  abstract findAll(): Promise<Order[]>;

  abstract findById(orderId: string): Promise<Order | null>;

  abstract findBySession(sessionId: string): Promise<Order[]>;

  abstract updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<Order | null>;
}
