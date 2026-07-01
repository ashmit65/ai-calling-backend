import { Test, TestingModule } from '@nestjs/testing';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';

describe('IntentController', () => {
  let controller: IntentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntentController],
      providers: [
        {
          provide: IntentService,
          useValue: {
            detect: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<IntentController>(IntentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
