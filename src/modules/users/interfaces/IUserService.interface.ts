import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from '../types/user-role.enum';
import { UserStatus } from '../types/user-status.enum';
import { IUser } from 'src/modules/auths/types/IUser.interface';

export interface IUserService {
  create(createUserDto: any): any;

  findUserByEmail(email: string): any;

  getAllUsers(
    pagination: PaginationParams,
    role: UserRole,
    user: IUser,
    status: UserStatus,
  ): Promise<any>;

  findUserById(id: string): any;

  updateStatus(id: string, status: string): any;
}
