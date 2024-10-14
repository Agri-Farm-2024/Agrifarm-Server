import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { IAuthService } from './interfaces/IAuthService.interface';
import { LoginDTO } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import { generateKeyPairSync } from 'crypto';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/caches/redis/redis.service';
import { TokenStatus } from 'src/utils/status/token-status.enum';

@Injectable()
export class AuthsService implements IAuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  /**
   *
   * @param data
   * @param typeLogin
   * 1. Check the login type
   * 2. Call the login strategy
   * @returns
   */

  async login(data: LoginDTO, typeLogin: string): Promise<any> {
    const loginStrategy = {
      emailAndPassword: this.loginWIthEmailAndPassword.bind(this),
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
   * 5. Return
   */
  async loginWIthEmailAndPassword(data: LoginDTO): Promise<LoginResponseDTO> {
    try {
      // 1. Find the user by email
      const user = await this.userService.findUserByEmail(data.email);

      Logger.log(JSON.stringify(user), `User found`);

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

      Logger.log(`Password match`);
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
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param payload
   * @returns
   * 1. Create 2 public and private keys pair
   * 2. Create a token with the payload and the private key
   */

  private async generateToken(payload: any): Promise<any> {
    try {
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
        algorithm: 'RS256',
      });

      const accessToken = this.jwtService.sign(payload, {
        secret: privateKey,
        expiresIn: '1d',
        algorithm: 'RS256',
      });
      // Verify the token with the public key
      const verifyToken = await this.jwtService.verifyAsync(accessToken, {
        secret: publicKey,
      });

      Logger.log(`Verify token: ${JSON.stringify(verifyToken)}`);
      //Save to redis
      await this.redisService.set(
        `token:${refreshToken}`,
        JSON.stringify({
          user_id: payload.id,
          publicKey: publicKey,
          status: TokenStatus.valid,
        }),
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getAccessToken(refreshToken: string): Promise<any> {
    const infoTokenStr = await this.redisService.get(`token:${refreshToken}`);
    const infoToken = JSON.parse(infoTokenStr);
    if (!infoToken) {
      throw new BadRequestException('Refresh token is invalid');
    }
    if (infoToken.status !== TokenStatus.valid) {
      if (infoToken.status === TokenStatus.logouted) {
        throw new BadRequestException('User is logged out');
      }
      if (infoToken.status === TokenStatus.invalid) {
        throw new BadRequestException('Refresh token is invalid');
      }
    }
    const payload = {
      id: infoToken.user_id,
      email: infoToken.email,
      full_name: infoToken.full_name,
      role: infoToken.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: infoToken.publicKey,
      expiresIn: '1d',
      algorithm: 'RS256',
    });
    return accessToken;
  }
}
