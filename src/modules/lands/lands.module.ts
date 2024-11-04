import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from './entities/land.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { LandURL } from './entities/landURL.entity';
import { LandType } from './entities/landType.entity';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [LandsController],
  providers: [LandsService],
  imports: [
    TypeOrmModule.forFeature([Land, LandURL, LandType]),
    LoggerModule,
    UsersModule,
    JwtModule,
  ],
  exports: [LandsService],
})
export class LandsModule {}
