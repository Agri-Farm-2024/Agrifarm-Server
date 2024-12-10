import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthService } from './interfaces/IAuthService.interface';
import { LoginDTO } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { LoginResponseDTO } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/caches/redis/redis.service';
import { MailService } from 'src/mails/mail.service';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { OTPStatus } from './types/otp-status.type';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/types/user-role.enum';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../users/types/user-status.enum';
import { IUser } from './types/IUser.interface';
import { IOtp } from './types/IntoOTP.type';

@Injectable()
export class AuthsService implements IAuthService {
  private readonly logger = new Logger(AuthsService.name);
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   *
   * @param data
   * @param typeLogin
   * 1. Check the login type
   * 2. Call the login strategy
   * @returns
   */

  async loginStrategy(data: LoginDTO, typeLogin: string): Promise<any> {
    try {
      const loginStrategy = {
        emailAndPassword: this.loginWIthEmailAndPassword.bind(this),
      };

      if (!loginStrategy[typeLogin]) {
        throw new BadRequestException('Invalid login type !');
      }

      return await loginStrategy[typeLogin](data);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *@function loginWIthEmailAndPassword
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

      if (!user) {
        throw new BadRequestException(`Email is not exist`);
      }

      if (user.status !== UserStatus.active) {
        throw new BadRequestException('User is not active');
      }
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
      const payload: IUser = {
        user_id: user.user_id,
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
      this.logger.error(error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async register(data: CreateUserDto): Promise<any> {
    // check role is valid
    if (data.role !== UserRole.land_renter) {
      throw new BadRequestException('Invalid role to register');
    }
    // check verify otp register
    const exist_otp = await this.redisService.get(`otp:${data.email}:register`);
    const exist_otp_obj: IOtp = JSON.parse(exist_otp);
    if (!exist_otp_obj || exist_otp_obj.status !== OTPStatus.verified) {
      throw new BadRequestException('Please verify the OTP first');
    }
    // call create user
    return await this.userService.create(data);
  }

  /**
   * @function sendOTPStrategy
   * @param email
   * @param type
   * @returns
   */

  async sendOTPStrategy(email: string, type: string): Promise<any> {
    const otpStrategy = {
      register: this.sendOTPRegister.bind(this),
      // forgotPassword: this.sendOTPForgotPassword.bind(this),
    };

    if (!otpStrategy[type]) {
      throw new BadRequestException('Invalid OTP type !');
    }

    return await otpStrategy[type](email);
  }

  /**
   * @function sendOTPRegister
   * @param email
   * 1. Check user is already registered
   * 2. Check redis exist otp
   * 3. Send OTP
   * 4. Save OTP to redis
   * @returns
   */

  async sendOTPRegister(email: string): Promise<any> {
    // check user is already registered
    const user = await this.userService.findUserByEmail(email);
    if (user) {
      throw new BadRequestException('You are already registered');
    }
    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000);
    // send otp
    await this.mailService.sendMail(
      email,
      SubjectMailEnum.otpVerifyMail,
      TemplateMailEnum.otpVerifyMail,
      { otp: otp },
    );
    // save otp to redis with expired time 5 minutes
    await this.redisService.set(
      `otp:${email}:register`,
      JSON.stringify({
        otp: otp,
        expired: Date.now() + 300000,
        status: OTPStatus.pending,
      }),
    );

    return `OTP is sent to ${email} please check your email`;
  }

  // private async sendOTPForgotPassword(email: string): Promise<void> {
  //   // check user is already registered
  //   const user = await this.userService.findUserByEmail(email);
  //   if (user) {
  //     throw new BadRequestException('You are already registered');
  //   }
  //   // check redis exist otp
  //   const otp = Math.floor(100000 + Math.random() * 900000);
  //   const exist_otp = await this.redisService.get(`otp:${email}:register`);
  //   const exist_otp_obj: InfoOTP = JSON.parse(exist_otp);

  //   if (exist_otp_obj) {
  //     if (otp === exist_otp_obj.otp) {
  //       throw new BadRequestException('OTP is already sent please check email');
  //     }
  //   }
  // }

  /**
   * @function verifyOTP
   */

  async verifyOTP(email: string, otp: number, type: string): Promise<any> {
    // get otp from redis
    const exist_otp = await this.redisService.get(`otp:${email}:${type}`);
    // parse to object
    const exist_otp_obj: IOtp = JSON.parse(exist_otp);
    if (!exist_otp_obj) {
      throw new BadRequestException('OTP is invalid');
    }
    // check otp is expired
    if (exist_otp_obj.expired_at < Date.now()) {
      throw new BadRequestException('OTP is expired');
    }
    // check otp is verified
    if (exist_otp_obj.status === OTPStatus.verified) {
      throw new BadRequestException('OTP is verified');
    }
    // check otp is match
    if (exist_otp_obj.otp !== otp) {
      throw new BadRequestException('OTP is invalid');
    }
    // update otp status
    exist_otp_obj.status = OTPStatus.verified;
    // save otp to redis
    await this.redisService.set(
      `otp:${email}:${type}`,
      JSON.stringify(exist_otp_obj),
    );
    return {
      status: OTPStatus.verified,
    };
  }

  async getAccessToken(refreshToken: string): Promise<any> {
    try {
      // // Get token from redis
      // const token_exist = await this.redisService.get(`token:${user_id}`);
      // const token_exist_obj: InfoToken[] = JSON.parse(token_exist);
      // if (!token_exist_obj) {
      //   throw new UnauthorizedException('Token not found');
      // }
      // // Find refresh token in token list
      // const found: InfoToken = token_exist_obj.find(
      //   (token: InfoToken) => token.refreshToken === refreshToken,
      // );
      // if (!found) {
      //   throw new UnauthorizedException('Token not found');
      // }
      // // Check if token is expired
      // if (found.status !== TokenStatus.valid) {
      //   throw new UnauthorizedException('Token is invalid');
      // }
      // Get private key and public key from config
      let privateKey = this.configService.get('JWT_PRIVATE_KEY');
      privateKey = privateKey.replace(/\\n/g, '\n');
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: privateKey,
      });
      // Generate a new token
      const payload: IUser = {
        user_id: decoded.user_id,
        email: decoded.email,
        full_name: decoded.full_name,
        role: decoded.role,
      };
      const accessToken = await this.jwtService.sign(payload, {
        secret: privateKey,
        expiresIn: '1d',
        algorithm: 'RS256',
      });
      return accessToken;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *@function generateToken
   * @param payload
   * @returns
   * 1. Create 2 public and private keys pair
   * 2. Create a token with the payload and the private key
   */

  private async generateToken(payload: IUser): Promise<any> {
    try {
      // Create 2 public and private keys with crypto
      const publicKey = this.configService
        .get('JWT_PUBLIC_KEY')
        .replace(/\\n/g, '\n');
      const privateKey = this.configService
        .get('JWT_PRIVATE_KEY')
        .replace(/\\n/g, '\n');
      // const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: 'spki',
      //     format: 'pem',
      //   },
      //   privateKeyEncoding: {
      //     type: 'pkcs8',
      //     format: 'pem',
      //   },
      // });
      // Logger.log(`Public key: ${publicKey}, Private key: ${privateKey}`);
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

      // console.log(`Access token: ${accessToken}`);
      // console.log(`Refresh token: ${refreshToken}`);
      // Verify the token with the public key
      const verifyToken = this.jwtService.verify(accessToken, {
        secret: publicKey,
      });

      this.logger.log(`Verify token: ${JSON.stringify(verifyToken)}`);
      //Save to redis
      // await this.redisService.set(
      //   `token:${refreshToken}`,
      //   JSON.stringify({
      //     user_id: payload.id,
      //     status: TokenStatus.valid,
      //   }),
      // );

      // Get token from redis
      // const token_exist = await this.redisService.get(
      //   `token:${payload.user_id}`,
      // );
      // let token_exist_obj: InfoToken[] = JSON.parse(token_exist);
      // if (!token_exist_obj) {
      //   token_exist_obj = [];
      // }
      // // Save to redis
      // token_exist_obj.push({
      //   refreshToken,
      //   status: TokenStatus.valid,
      // });
      // await this.redisService.set(
      //   `token:${payload.user_id}`,
      //   JSON.stringify(token_exist_obj),
      // );
      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
