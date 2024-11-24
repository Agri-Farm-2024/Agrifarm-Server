import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { RequestsModule } from '../requests/requests.module';
import { ServicesModule } from '../servicesPackage/servicesPackage.module';

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [RequestsModule, ServicesModule],
})
export class TestModule {}
