import { Test, TestingModule } from '@nestjs/testing';
import { ExtendsController } from './extends.controller';
import { ExtendsService } from './extends.service';

describe('ExtendsController', () => {
  let controller: ExtendsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtendsController],
      providers: [ExtendsService],
    }).compile();

    controller = module.get<ExtendsController>(ExtendsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
