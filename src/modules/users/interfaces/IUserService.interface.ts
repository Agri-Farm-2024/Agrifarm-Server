import { PaginationParams } from 'src/common/decorations/types/pagination.type';

export interface IUserService {
  create(createUserDto: any): any;

  findUserByEmail(email: string): any;

  getAllUsers(pagination: PaginationParams): Promise<any>;
}
