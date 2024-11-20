import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { RequestsModule } from '../requests/requests.module';

@Module({
  controllers: [TestController],
  providers: [TestService],
  imports: [RequestsModule],
})
export class TestModule {}
