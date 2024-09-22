export interface IUserService {
  create(createUserDto: any): any;
  findAll(): any;
  findOne(id: string): any;
  update(id: string, updateUserDto: any): any;
  remove(id: string): any;
}
