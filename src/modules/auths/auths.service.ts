import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IAuthService } from './interfaces/IAuthService.interface';
import { LoginDTO } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import { generateKeyPairSync } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/caches/redis/redis.service';

@Injectable()
export class AuthsService implements IAuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(data: LoginDTO, typeLogin: string): Promise<any> {
    const loginStrategy = {
      email: this.loginWIthEmailAndPassword.bind(this),
    };

    if (!loginStrategy[typeLogin]) {
      throw new BadRequestException('Invalid login type !');
    }

    return await loginStrategy[typeLogin](data);
  }

  /**
   *
   * @param data
   * @returns
   * 1. Find the user by email
   * 2. Check the password
   * 3. Generate a token
   * 4. Save the token to the redis
   * 5. Return the token
   */
  async loginWIthEmailAndPassword(data: LoginDTO): Promise<LoginResponseDTO> {
    // 1. Find the user by email
    const user = await this.userService.findUserByEmail(data.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }
    // 2. Check the password
    const isPasswordMatch = await bcrypt.compareSync(
      data.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid password');
    }
    // 3. Generate a token
    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
    const token = await this.generateToken(payload);
    // 4. Save the token to the redis
    // await this.redisService.set(user.id, token.refreshToken);
    return {
      user: user,
      token,
    };
  }

  /**
   *
   * @param payload
   * @returns
   * 1. Create 2 public and private keys pair
   * 2. Create a token with the payload and the private key
   */

  async generateToken(payload: any): Promise<any> {
    // Create 2 public and private keys with crypto
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    // Create tokens with the payload and the private key
    const refreshToken = this.jwtService.sign(payload, {
      secret: privateKey,
    });

    const accessToken = this.jwtService.sign(payload, {
      secret: privateKey,
      expiresIn: '1d',
    });
    // Verify the token with the public key
    const verifyToken = this.jwtService.verify(accessToken, {
      secret: publicKey,
    });

    Logger.log(`Verify token: ${JSON.stringify(verifyToken)}`);

    return {
      accessToken,
      refreshToken,
      publicKey,
    };
  }
}
