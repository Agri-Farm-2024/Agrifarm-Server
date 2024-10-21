import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from '../types/user-role.enum';

export interface IUserService {
  create(createUserDto: any): any;

  findUserByEmail(email: string): any;

  getAllUsers(pagination: PaginationParams, role: UserRole): Promise<any>;

  findUserById(id: string): any;

  updateStatus(id: string, status: string): any;
}
