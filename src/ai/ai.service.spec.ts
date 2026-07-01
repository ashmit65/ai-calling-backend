import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

process.env.NVIDIA_API_KEY = 'mock-key';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
