import { TokenStatus } from './token-status.enum';

export interface InfoToken {
  refreshToken: string;
  status: TokenStatus;
}
