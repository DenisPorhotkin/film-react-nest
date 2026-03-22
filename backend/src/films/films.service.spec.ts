import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { FilmsRepository } from '../repository/films.repository.interface';

describe('FilmsService', () => {
  let service: FilmsService;
  let mockFilmsRepository: jest.Mocked<FilmsRepository>;

  beforeEach(async () => {
    mockFilmsRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByScheduleId: jest.fn(),
      reserveSeat: jest.fn(),
      releaseSeat: jest.fn(),
      getAvailableSeats: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: FilmsRepository, useValue: mockFilmsRepository },
      ],
    }).compile();

    service = module.get<FilmsService>(FilmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
