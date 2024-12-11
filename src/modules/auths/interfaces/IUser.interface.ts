import { UserRole } from 'src/modules/users/types/user-role.enum';

export interface IUser {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
}
