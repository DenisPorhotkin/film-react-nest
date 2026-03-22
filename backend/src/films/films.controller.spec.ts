import { Test, TestingModule } from '@nestjs/testing';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let service: FilmsService;

  const mockFilmsService = {
    findAll: jest.fn().mockResolvedValue({ total: 2, items: [] }),
    findOne: jest.fn().mockResolvedValue({ id: '1', title: 'Test' }),
    findSchedule: jest.fn().mockResolvedValue({ total: 0, items: [] }),
    getAvailableSeats: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [
        { provide: FilmsService, useValue: mockFilmsService },
      ],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
    service = module.get<FilmsService>(FilmsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all films', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual({ total: 2, items: [] });
    });
  });

  describe('findOne', () => {
    it('should return a film by id', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual({ id: '1', title: 'Test' });
    });
  });

  describe('findSchedule', () => {
    it('should return schedule for a film', async () => {
      const result = await controller.findSchedule('1');
      expect(service.findSchedule).toHaveBeenCalledWith('1');
      expect(result).toEqual({ total: 0, items: [] });
    });
  });

  describe('getAvailableSeats', () => {
    it('should return available seats', async () => {
      const result = await controller.getAvailableSeats('1', 's1');
      expect(service.getAvailableSeats).toHaveBeenCalledWith('1', 's1');
      expect(result).toEqual([]);
    });
  });
});