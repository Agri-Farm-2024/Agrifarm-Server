import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from 'src/caches/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { TokenStatus } from 'src/modules/auths/types/token-status.enum';
import { InfoToken } from 'src/modules/auths/types/InfoToken.type';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private readonly redisSerivce: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get access token from request headers
    let accessToken = request.headers['authorization'];
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }
    accessToken = accessToken?.split(' ')[1];

    // Get refresh token from request headers
    const refreshToken = request.headers['refresh'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    // Check if refresh token exists in Redis
    const infoTokenStr = await this.redisSerivce.get(`token:${refreshToken}`);
    const infoToken: InfoToken = JSON.parse(infoTokenStr);
    if (!infoToken || infoToken.status !== TokenStatus.valid) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    // Validate the access token
    try {
      // Get public key from config
      let publicKey = this.configService.get('JWT_PUBLIC_KEY');
      publicKey = publicKey.replace(/\\n/g, '\n');
      // Verify access token
      const decoded = this.jwtService.verify(accessToken, {
        secret: publicKey,
      });

      if (decoded.id !== infoToken.user_id) {
        throw new UnauthorizedException('Access token is invalid with user');
      }

      Logger.log(decoded, 'Decoded');
      // add decoded to request
      request['user'] = decoded;
      // Check roles if defined
      const roles = this.reflector.get<number[]>('roles', context.getHandler());
      if (roles && !roles.includes(decoded.role)) {
        throw new ForbiddenException('Forbidden access');
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException(error.message);
    }
  }
}
