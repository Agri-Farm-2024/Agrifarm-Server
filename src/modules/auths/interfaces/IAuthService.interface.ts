import { LoginResponseDTO } from '../dto/login-response.dto';
import { LoginDTO } from '../dto/login.dto';

export interface IAuthService {
  login(data: LoginDTO, typeLogin: string): Promise<any>;

  loginWIthEmailAndPassword(data: LoginDTO): Promise<LoginResponseDTO>;

  // getAccessToken(refreshToken: string): Promise<any>;
}
