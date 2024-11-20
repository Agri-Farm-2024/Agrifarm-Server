import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TestService } from './test.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';

@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('/testnoti//:user_id')
  async test(@Param('user_id') id: string): Promise<any> {
    await this.testService.testNoti(id);
  }

  @Get()
  async testGet(): Promise<any> {
    return await this.testService.test();
  }
}
