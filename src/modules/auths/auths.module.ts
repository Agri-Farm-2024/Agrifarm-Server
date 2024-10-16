import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { LoggerModule } from '../../logger/logger.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [LoggerModule, UsersModule, JwtModule],
  controllers: [AuthsController],
  providers: [AuthsService],
})
export class AuthsModule {}
