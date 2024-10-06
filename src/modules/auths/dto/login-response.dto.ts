import { User } from 'src/modules/users/entities/user.entity';

export class LoginResponseDTO {
  user: User;
  token: {
    accessToken: string;
    refreshToken: string;
    publicKey: string;
  };
}
