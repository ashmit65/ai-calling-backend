import { Test, TestingModule } from '@nestjs/testing';
import { IntentService } from './intent.service';
import { CacheService } from '../redis/cache.service';

describe('IntentService', () => {
  let service: IntentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentService,
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<IntentService>(IntentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
