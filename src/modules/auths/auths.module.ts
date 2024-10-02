import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { LoggerModule } from '../../logger/logger.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [LoggerModule.register('Auth-Module'), UsersModule],
  controllers: [AuthsController],
  providers: [AuthsService],
})
export class AuthsModule {}
