import { Module } from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { ExtendsController } from './extends.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Extend } from './entities/extend.entity';

@Module({
  controllers: [ExtendsController],
  providers: [ExtendsService],
  imports: [TypeOrmModule.forFeature([Extend])],
})
export class ExtendsModule {}
