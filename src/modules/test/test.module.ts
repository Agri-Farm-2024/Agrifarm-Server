import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { RequestsModule } from '../requests/requests.module';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';
import { CronsModule } from 'src/crons/crons.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [RequestsModule, ServicesModule, CronsModule, UsersModule],
})
export class TestModule {}
