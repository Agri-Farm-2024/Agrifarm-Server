export interface IUserService {
  create(createUserDto: any): any;

  findUserByEmail(email: string): any;
}
