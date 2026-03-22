import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { FilmsRepository } from '../repository/films.repository.interface';
import { OrderRepository } from '../repository/order.repository.interface';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus } from './order-status.enum';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

// Мок репозиториев
const mockFilmsRepository = {
  findByScheduleId: jest.fn(),
  reserveSeat: jest.fn(),
  releaseSeat: jest.fn(),
};

const mockOrderRepository = {
  create: jest.fn(),
  cancelOrder: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  updateStatus: jest.fn(),
};

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: FilmsRepository, useValue: mockFilmsRepository },
        { provide: OrderRepository, useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockFilm = {
      id: '5b70cb1a-61c9-47b1-b207-31f9e89087ff',
      title: 'Стражи Гримуара',
      schedule: [
        {
          id: '208ec902-8955-4a52-bdc3-a6ff04602ed9',
          daytime: '2024-06-30T18:00:53+03:00',
          hall: 1,
          rows: 8,
          seats: 12,
          price: 350,
          taken: ['3:3', '4:4'],
        },
      ],
    };

    const mockCreateOrderDto: CreateOrderDto = {
      email: 'portkin@gmail.com',
      phone: '+76223335142',
      tickets: [
        {
          film: '5b70cb1a-61c9-47b1-b207-31f9e89087ff',
          session: '208ec902-8955-4a52-bdc3-a6ff04602ed9',
          daytime: '2024-06-30T18:00:53+03:00',
          day: '30 июня',
          time: '18:00',
          row: 3,
          seat: 4,
          price: 350,
        },
        {
          film: '5b70cb1a-61c9-47b1-b207-31f9e89087ff',
          session: '208ec902-8955-4a52-bdc3-a6ff04602ed9',
          daytime: '2024-06-30T18:00:53+03:00',
          day: '30 июня',
          time: '18:00',
          row: 4,
          seat: 4,
          price: 350,
        },
      ],
    };

    const mockOrder = {
      orderId: 'test-order-id',
      filmId: '5b70cb1a-61c9-47b1-b207-31f9e89087ff',
      sessionId: '208ec902-8955-4a52-bdc3-a6ff04602ed9',
      filmTitle: 'Стражи Гримуара',
      daytime: new Date('2024-06-30T18:00:53+03:00'),
      hall: 1,
      row: 3,
      seat: 4,
      price: 350,
      seatKey: '3:4',
      status: OrderStatus.CONFIRMED,
      customerEmail: 'portkin@gmail.com',
      customerPhone: '+76223335142',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully create an order with multiple tickets', async () => {
      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);
      mockFilmsRepository.reserveSeat.mockResolvedValue(true);
      mockOrderRepository.create
        .mockResolvedValueOnce({ ...mockOrder, row: 3, seat: 4 })
        .mockResolvedValueOnce({ ...mockOrder, row: 4, seat: 4 });

      const result = await service.create(mockCreateOrderDto);

      expect(result).toHaveProperty('total', 2);
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toHaveProperty('row', 3);
      expect(result.items[1]).toHaveProperty('row', 4);
      expect(mockFilmsRepository.reserveSeat).toHaveBeenCalledTimes(2);
      expect(mockOrderRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when film not found', async () => {
      mockFilmsRepository.findByScheduleId.mockResolvedValue(null);

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when schedule not found', async () => {
      mockFilmsRepository.findByScheduleId.mockResolvedValue({
        ...mockFilm,
        schedule: [],
      });

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when date does not match', async () => {
      const wrongDateDto = {
        ...mockCreateOrderDto,
        tickets: [
          {
            ...mockCreateOrderDto.tickets[0],
            daytime: '2024-07-01T18:00:53+03:00',
          },
        ],
      };

      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);

      await expect(service.create(wrongDateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when price does not match', async () => {
      const wrongPriceDto = {
        ...mockCreateOrderDto,
        tickets: [
          {
            ...mockCreateOrderDto.tickets[0],
            price: 400,
          },
        ],
      };

      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);

      await expect(service.create(wrongPriceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when row is invalid', async () => {
      const invalidRowDto = {
        ...mockCreateOrderDto,
        tickets: [
          {
            ...mockCreateOrderDto.tickets[0],
            row: 10,
          },
        ],
      };

      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);

      await expect(service.create(invalidRowDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when seat is already taken', async () => {
      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);
      mockFilmsRepository.reserveSeat.mockResolvedValue(false);

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rollback all reservations when one fails', async () => {
      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);
      // Первое место успешно
      mockFilmsRepository.reserveSeat.mockResolvedValueOnce(true);
      // Второе место занято
      mockFilmsRepository.reserveSeat.mockResolvedValueOnce(false);
      // Мок для создания заказа первого билета
      mockOrderRepository.create.mockResolvedValue(mockOrder);

      await expect(service.create(mockCreateOrderDto)).rejects.toThrow(
        ConflictException,
      );

      // Проверяем, что releaseSeat был вызван для отката первого места
      expect(mockFilmsRepository.releaseSeat).toHaveBeenCalledWith(
        mockFilm.id,
        mockFilm.schedule[0].id,
        3,
        4,
      );
      // Проверяем, что cancelOrder был вызван для первого заказа
      expect(mockOrderRepository.cancelOrder).toHaveBeenCalledWith(
        'test-order-id',
      );
    });

    it('should handle single ticket order', async () => {
      const singleTicketDto = {
        ...mockCreateOrderDto,
        tickets: [mockCreateOrderDto.tickets[0]],
      };

      mockFilmsRepository.findByScheduleId.mockResolvedValue(mockFilm);
      mockFilmsRepository.reserveSeat.mockResolvedValue(true);
      mockOrderRepository.create.mockResolvedValue(mockOrder);

      const result = await service.create(singleTicketDto);

      expect(result).toHaveProperty('total', 1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('row', 3);
    });
  });

  describe('findAll', () => {
    it('should return all orders', async () => {
      const mockOrders = [
        {
          orderId: 'order-1',
          filmId: 'film-1',
          sessionId: 'session-1',
          filmTitle: 'Film 1',
          daytime: new Date(),
          hall: 1,
          row: 1,
          seat: 1,
          price: 350,
          seatKey: '1:1',
          status: OrderStatus.CONFIRMED,
          customerEmail: 'test@test.com',
          customerPhone: '+79999999999',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          orderId: 'order-2',
          filmId: 'film-2',
          sessionId: 'session-2',
          filmTitle: 'Film 2',
          daytime: new Date(),
          hall: 2,
          row: 2,
          seat: 2,
          price: 400,
          seatKey: '2:2',
          status: OrderStatus.CONFIRMED,
          customerEmail: 'test2@test.com',
          customerPhone: '+78888888888',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockOrderRepository.findAll.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'order-1');
      expect(result[1]).toHaveProperty('id', 'order-2');
      expect(mockOrderRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no orders', async () => {
      mockOrderRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const mockOrder = {
        orderId: 'test-order-id',
        filmId: 'film-1',
        sessionId: 'session-1',
        filmTitle: 'Film 1',
        daytime: new Date(),
        hall: 1,
        row: 1,
        seat: 1,
        price: 350,
        seatKey: '1:1',
        status: OrderStatus.CONFIRMED,
        customerEmail: 'test@test.com',
        customerPhone: '+79999999999',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.findOne('test-order-id');

      expect(result).toHaveProperty('id', 'test-order-id');
      expect(result).toHaveProperty('film', 'film-1');
      expect(result).toHaveProperty('session', 'session-1');
      expect(result).toHaveProperty('row', 1);
      expect(result).toHaveProperty('seat', 1);
      expect(result).toHaveProperty('price', 350);
      expect(result).toHaveProperty('status', OrderStatus.CONFIRMED);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith(
        'test-order-id',
      );
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should cancel an order', async () => {
      const mockOrder = {
        orderId: 'test-order-id',
        status: OrderStatus.CONFIRMED,
      };

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockOrderRepository.updateStatus.mockResolvedValue({
        ...mockOrder,
        status: OrderStatus.CANCELLED,
      });

      await service.remove('test-order-id');

      expect(mockOrderRepository.findById).toHaveBeenCalledWith(
        'test-order-id',
      );
      expect(mockOrderRepository.updateStatus).toHaveBeenCalledWith(
        'test-order-id',
        OrderStatus.CANCELLED,
      );
    });

    it('should throw NotFoundException when order to cancel is not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
