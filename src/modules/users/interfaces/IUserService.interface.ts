import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from '../types/user-role.enum';
import { Payload } from 'src/modules/auths/types/payload.type';

export interface IUserService {
  create(createUserDto: any): any;

  findUserByEmail(email: string): any;

  getAllUsers(
    pagination: PaginationParams,
    role: UserRole,
    user: Payload,
  ): Promise<any>;

  findUserById(id: string): any;

  updateStatus(id: string, status: string): any;
}
