import { UserRole } from 'src/modules/users/types/user-role.enum';

export interface Payload {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}
