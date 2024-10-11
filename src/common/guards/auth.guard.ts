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
import { IInfoToken } from 'src/modules/auths/interfaces/IInfoToken.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private readonly redisSerivce: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Get access token from request headers
    const accessToken = request.headers['author'];
    if (Array.isArray(accessToken)) {
      throw new UnauthorizedException('Access token is invalid');
    }
    Logger.log(accessToken, 'Access token');

    // Get refresh token from request headers
    const refreshToken = request.headers['refresh'];
    Logger.log(refreshToken, 'Refresh token');

    // Check if access token is missing
    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }

    // Check if refresh token is missing
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    // Check if refresh token exists in Redis
    const infoTokenStr = await this.redisSerivce.get(`token:${refreshToken}`);
    const infoToken: IInfoToken = JSON.parse(infoTokenStr);
    if (!infoToken) {
      throw new UnauthorizedException('Refresh token is invalid');
    }

    // Validate the access token
    try {
      const decoded = this.jwtService.verify(accessToken, {
        secret: infoToken.publicKey,
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
      throw new UnauthorizedException(error.message);
    }
  }
}
