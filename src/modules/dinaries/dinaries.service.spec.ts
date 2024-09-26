import { Test, TestingModule } from '@nestjs/testing';
import { DinariesService } from './dinaries.service';

describe('DinariesService', () => {
  let service: DinariesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DinariesService],
    }).compile();

    service = module.get<DinariesService>(DinariesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
