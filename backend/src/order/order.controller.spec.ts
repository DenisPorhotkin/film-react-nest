import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { ThrottlerModule } from '@nestjs/throttler';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  const mockOrderService = {
    create: jest.fn().mockResolvedValue({ total: 1, items: [] }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'order1' }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
      ],
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const dto: CreateOrderDto = {
        email: 'test@test.com',
        phone: '+79999999999',
        tickets: [],
      };
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ total: 1, items: [] });
    });
  });

  describe('findAll', () => {
    it('should return all orders with pagination', async () => {
      const result = await controller.findAll(10, 0);
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const result = await controller.findOne('order1');
      expect(service.findOne).toHaveBeenCalledWith('order1');
      expect(result).toEqual({ id: 'order1' });
    });
  });

  describe('remove', () => {
    it('should cancel an order', async () => {
      await controller.remove('order1');
      expect(service.remove).toHaveBeenCalledWith('order1');
    });
  });
});