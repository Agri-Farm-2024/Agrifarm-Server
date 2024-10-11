export interface IUserService {
  create(createUserDto: any): any;

  findUserByEmail(email: string): any;

  getAllUsers(page_size: number, page_index: number): Promise<any>;
}
