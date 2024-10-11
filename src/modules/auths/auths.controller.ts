import { Controller, Post, Body, Query } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';

@Controller('auths')
@ApiTags('Auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @ApiQuery({
    name: 'type_login',
    required: false,
    example: 'emailAndPassword',
  })
  @Post('/login')
  async login(@Body() data: LoginDTO, @Query('type_login') typeLogin: string) {
    return await this.authsService.login(data, typeLogin);
  }
}
