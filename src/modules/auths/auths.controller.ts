import { Controller, Post, Body, Query, Request, Get } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { OTPDto } from './dto/otp.dto';
import { OTPVerifyDTO } from './dto/otp-verify.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GetAccessTokenDto } from './dto/get-accessToken.dto';

@Controller('auths')
@ApiTags('Auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @ApiQuery({
    name: 'type',
    required: false,
    example: 'emailAndPassword',
    description: 'type of login: emailAndPassword',
  })
  @Post('/login')
  async login(@Body() data: LoginDTO, @Query('type') typeLogin: string) {
    return await this.authsService.loginStrategy(data, typeLogin);
  }

  @ApiQuery({
    name: 'type',
    required: false,
    example: 'register',
    description: 'type of otp: register or forgotPassword',
  })
  @Post('/sendOTP')
  async sendOTP(@Body() data: OTPDto, @Query('type') type: string) {
    return await this.authsService.sendOTPStrategy(data.email, type);
  }

  @ApiQuery({
    name: 'type',
    required: false,
    example: 'register',
    description: 'type of otp: register or forgotPassword',
  })
  @Post('/verifyOTP')
  async verifyOTP(@Body() data: OTPVerifyDTO, @Query('type') type: string) {
    return await this.authsService.verifyOTP(data.email, data.otp, type);
  }

  @Post('/register')
  async register(@Body() data: CreateUserDto) {
    return await this.authsService.register(data);
  }

  @Get('/getAccessToken')
  async getAccessToken(@Request() data: any) {
    const header = data.headers;
    const refreshToken = header['refresh'];
    return await this.authsService.getAccessToken(refreshToken);
  }
}
