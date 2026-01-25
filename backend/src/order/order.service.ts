import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import {
  CreateOrderDto,
  OrderListResponseDto,
  OrderResponseDto,
} from './dto/order.dto';
import { FilmsRepository } from '../repository/films.repository.interface';
import { OrderRepository } from '../repository/order.repository';
import { OrderStatus } from './entities/order.entity';
import { FileLoggerService } from '../common/logger/file-logger.service';

@Injectable()
export class OrderService {
  private readonly nameService = OrderService.name;
  private readonly logger = new FileLoggerService(this.nameService);
  constructor(
    @Inject(FilmsRepository)
    private readonly filmsRepository: FilmsRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderListResponseDto> {
    const { email, phone, tickets } = createOrderDto;
    const results: OrderResponseDto[] = [];

    // Обрабатываем каждый билет в заказе
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      try {
        // Находим фильм по ID сеанса
        const film = await this.filmsRepository.findByScheduleId(
          ticket.session,
        );

        if (!film) {
          this.logger.warn(
            `[${this.nameService}] Фильм или сеанс не найдены для билета ${i + 1}`,
          );
          throw new NotFoundException(
            `Фильм или сеанс не найдены для билета ${i + 1}`,
          );
        }

        const schedule = film.schedule?.find((s) => s.id === ticket.session);
        if (!schedule) {
          this.logger.warn(
            `[${this.nameService}] Сеанс не найден для билета ${i + 1}`,
          );
          throw new NotFoundException(`Сеанс не найден для билета ${i + 1}`);
        }

        // Проверка времени и цены
        const ticketDate = new Date(ticket.daytime);
        const scheduleDate = new Date(schedule.daytime);

        if (Math.abs(ticketDate.getTime() - scheduleDate.getTime()) > 60000) {
          this.logger.warn(
            `[${this.nameService}] Дата сеанса не совпадает для билета ${i + 1}`,
          );
          throw new BadRequestException(
            `Дата сеанса не совпадает для билета ${i + 1}`,
          );
        }

        if (ticket.price !== schedule.price) {
          this.logger.warn(
            `[${this.nameService}] Цена билета не совпадает для билета ${i + 1}`,
          );
          throw new BadRequestException(
            `Цена билета не совпадает для билета ${i + 1}`,
          );
        }

        // Проверка ряда и места
        if (
          ticket.row < 1 ||
          ticket.row > schedule.rows ||
          ticket.seat < 1 ||
          ticket.seat > schedule.seats
        ) {
          this.logger.warn(
            `[${this.nameService}] Неверный ряд или место для билета ${i + 1}`,
          );
          throw new BadRequestException(
            `Неверный ряд или место для билета ${i + 1}`,
          );
        }

        // Бронирование места
        const isReserved = await this.filmsRepository.reserveSeat(
          film.id,
          schedule.id,
          ticket.row,
          ticket.seat,
        );

        if (!isReserved) {
          this.logger.warn(
            `[${this.nameService}] Место уже занято для билета ${i + 1}`,
          );
          throw new ConflictException(`Место уже занято для билета ${i + 1}`);
        }

        // Создание записи заказа
        const orderData = {
          film: ticket.film,
          session: ticket.session,
          daytime: ticket.daytime,
          row: ticket.row,
          seat: ticket.seat,
          price: ticket.price,
          customerEmail: email,
          customerPhone: phone,
        };

        const order = await this.orderRepository.create(
          orderData,
          film.title,
          schedule.hall,
        );

        results.push({
          id: order.orderId,
          film: order.filmId,
          session: order.sessionId,
          row: order.row,
          seat: order.seat,
          price: order.price,
          status: order.status,
          createdAt: order.createdAt,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
        });
      } catch (error) {
        // Откатываем все предыдущие бронирования
        for (let j = 0; j < results.length; j++) {
          // Освобождаем место в расписании
          const failedTicket = tickets[j];
          await this.filmsRepository.releaseSeat(
            failedTicket.film,
            failedTicket.session,
            failedTicket.row,
            failedTicket.seat,
          );
          // Удаляем созданный заказ
          await this.orderRepository.cancelOrder(results[j].id);
        }
        this.logger.error(
          `[${this.nameService}] Ошибка при создании заказа: ${error.message}`,
        );
        throw error;
      }
    }

    return {
      total: results.length,
      items: results,
    };
  }

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();

    return orders.map((order) => ({
      id: order.orderId,
      film: order.filmId,
      session: order.sessionId,
      row: order.row,
      seat: order.seat,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    }));
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      this.logger.warn(`[${this.nameService}] Заказ с ID ${id} не найден`);
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    return {
      id: order.orderId,
      film: order.filmId,
      session: order.sessionId,
      row: order.row,
      seat: order.seat,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    };
  }

  async remove(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      this.logger.warn(`[${this.nameService}] Заказ с ID ${id} не найден`);
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    await this.orderRepository.updateStatus(id, OrderStatus.CANCELLED);
  }
}
