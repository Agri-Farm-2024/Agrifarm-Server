import { Controller, Post, Body, Query, Request, Get } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dto/login.dto';
import { OTPDto } from './dto/otp.dto';
import { OTPVerifyDTO } from './dto/otp-verify.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResetPasswordDTO } from './dto/reset -password.dto';

@Controller('auths')
@ApiTags('Auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('/login')
  @ApiQuery({
    name: 'type',
    required: false,
    example: 'emailAndPassword',
    description: 'type of login: emailAndPassword',
  })
  async login(@Body() data: LoginDTO, @Query('type') typeLogin: string) {
    return await this.authsService.loginStrategy(data, typeLogin);
  }

  @Post('/sendOTP')
  @ApiQuery({
    name: 'type',
    required: false,
    example: 'register',
    description: 'type of otp: register or forgotPassword',
  })
  async sendOTP(@Body() data: OTPDto, @Query('type') type: string) {
    return await this.authsService.sendOTPStrategy(data.email, type);
  }

  @Post('/verifyOTP')
  @ApiQuery({
    name: 'type',
    required: false,
    example: 'register',
    description: 'type of otp: register or forgotPassword',
  })
  async verifyOTP(@Body() data: OTPVerifyDTO, @Query('type') type: string) {
    return await this.authsService.verifyOTP(data.email, data.otp, type);
  }

  @Post('/register')
  async register(@Body() data: CreateUserDto) {
    return await this.authsService.register(data);
  }

  @Post('/resetPassword')
  async resetPassword(@Body() data: ResetPasswordDTO) {
    return await this.authsService.resetPassword(data);
  }

  @Get('/getAccessToken')
  async getAccessToken(@Request() data: any) {
    const header = data.headers;
    const refreshToken = header['refresh'];
    // const user_id = header['user_id'];
    return await this.authsService.getAccessToken(refreshToken);
  }
}
