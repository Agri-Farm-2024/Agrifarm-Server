import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LoggerModule } from '../../logger/logger.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    LoggerModule.register('User-Module'),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [UsersService],
})
export class UsersModule {}
