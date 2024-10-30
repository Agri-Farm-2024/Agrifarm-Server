import { LoginResponseDTO } from '../dto/login-response.dto';
import { LoginDTO } from '../dto/login.dto';

export interface IAuthService {
  loginStrategy(data: LoginDTO, typeLogin: string): Promise<any>;

  loginWIthEmailAndPassword(data: LoginDTO): Promise<LoginResponseDTO>;

  sendOTPStrategy(email: string, type: string): Promise<any>;

  sendOTPRegister(email: string): Promise<any>;

  verifyOTP(email: string, otp: number, type: string): Promise<any>;

  getAccessToken(refreshToken: string, user_id: string): Promise<any>;

  // getAccessToken(refreshToken: string): Promise<any>;
}
