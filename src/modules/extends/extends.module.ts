import { Module } from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { ExtendsController } from './extends.controller';

@Module({
  controllers: [ExtendsController],
  providers: [ExtendsService],
})
export class ExtendsModule {}
