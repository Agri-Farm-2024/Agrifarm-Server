import { BadRequestException, Injectable } from '@nestjs/common';
import { IAuthService } from './interfaces/IAuthService.interface';
import { LoginDTO } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { LoginResponseDTO } from './dto/login-response.dto';

@Injectable()
export class AuthsService implements IAuthService {
  constructor(private readonly userService: UsersService) {}

  async login(data: LoginDTO, typeLogin: string): Promise<any> {
    const loginStrategy = {
      email: this.loginWIthEmailAndPassword.bind(this),
    };

    if (!loginStrategy[typeLogin]) {
      throw new BadRequestException('Invalid login type !');
    }

    return await loginStrategy[typeLogin](data);
  }

  async loginWIthEmailAndPassword(data: LoginDTO): Promise<any> {
    return 'test';
  }
}
