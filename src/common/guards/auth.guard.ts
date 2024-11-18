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

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
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

    // // Get refresh token from request headers
    // const refreshToken = request.headers['refresh'];

    // if (!refreshToken) {
    //   throw new UnauthorizedException('Refresh token is missing');
    // }

    // Validate the access token
    try {
      // Get public key from config
      let publicKey = this.configService.get('JWT_PUBLIC_KEY');
      publicKey = publicKey.replace(/\\n/g, '\n');
      // Verify access token
      const decoded = this.jwtService.verify(accessToken, {
        secret: publicKey,
      });
      this.logger.log(decoded, 'Decoded');
      // // Check if token is exist
      // const token_exist = await this.redisSerivce.get(
      //   `token:${decoded.user_id}`,
      // );
      // if (!token_exist) {
      //   throw new UnauthorizedException('Token is not exist');
      // }
      // const token_exist_json = JSON.parse(token_exist);
      // // Find refresh token in token list
      // const found = token_exist_json.find(
      //   (token: InfoToken) => token.refreshToken === refreshToken,
      // );
      // if (!found) {
      //   throw new UnauthorizedException('Token not found');
      // }
      // // Check if token is expired
      // if (found.status !== TokenStatus.valid) {
      //   throw new UnauthorizedException('Token is invalid');
      // }
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
