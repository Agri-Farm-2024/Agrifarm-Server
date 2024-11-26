import { TokenStatus } from './token-status.enum';

export interface IToken {
  refreshToken: string;
  status: TokenStatus;
}
