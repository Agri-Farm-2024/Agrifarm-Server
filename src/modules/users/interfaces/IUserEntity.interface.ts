export interface IUserEntity {
  id: number;
  email: string;
  password: string;
  full_name: string;
  dob: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
