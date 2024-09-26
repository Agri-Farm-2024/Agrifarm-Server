import { Test, TestingModule } from '@nestjs/testing';
import { DinariesController } from './dinaries.controller';
import { DinariesService } from './dinaries.service';

describe('DinariesController', () => {
  let controller: DinariesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DinariesController],
      providers: [DinariesService],
    }).compile();

    controller = module.get<DinariesController>(DinariesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
