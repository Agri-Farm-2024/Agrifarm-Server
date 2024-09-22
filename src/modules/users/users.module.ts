import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [LoggerModule.register('UsersModule')],
})
export class UsersModule {}
