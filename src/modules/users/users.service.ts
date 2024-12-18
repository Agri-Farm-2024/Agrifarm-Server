import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { In, Like, MoreThan, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../../logger/logger.service';
import { MailService } from 'src/mails/mail.service';
import { IUserService } from './interfaces/IUserService.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { UserStatus } from './types/user-status.enum';
import { UserRole } from './types/user-role.enum';
import { IUser } from '../auths/interfaces/IUser.interface';
import { RequestStatus } from '../requests/types/request-status.enum';

@Injectable()
export class UsersService implements IUserService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly loggerService: LoggerService,
    private readonly mailService: MailService,
  ) {}

  /**
   *  Find user by email call by other services
   * @param email
   * @returns
   */

  async findUserByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: email,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *@function create
   * @param createUserDto
   * @logic
   * 1. Check email is already exists
   * 2. Hash the password
   * 3. Create a new user
   * 4. Send a welcome email
   * @returns
   */
  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      // check user role
      if (createUserDto.role === UserRole.manager) {
        const manager_exist = await this.userRepository.findOne({
          where: {
            role: UserRole.manager,
          },
        });
        if (manager_exist) {
          throw new BadRequestException('Manager already exists');
        }
      }
      // check role admin
      if (createUserDto.role === UserRole.admin) {
        throw new BadRequestException('Invalid role');
      }
      // check email is already exists
      const user = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
      if (user) {
        throw new BadRequestException('Email already exists');
      }
      // generate password
      const password = this.generatePassword();
      // Hash the password
      const password_hash = await this.hashPassword(password);
      // Create a new user
      const new_user = await this.userRepository.save({
        ...createUserDto,
        password: password_hash,
      });
      // Log the user creation
      this.loggerService.log(`New User created with email: ${new_user.email}`);
      // Send a welcome email
      this.mailService.sendMail(
        new_user.email,
        SubjectMailEnum.registerWelcome,
        TemplateMailEnum.registerWelcome,
        {
          full_name: new_user.full_name,
          email: new_user.email,
          phone: new_user.phone,
          password: password,
          created_at: new_user.created_at.toLocaleDateString(),
          status: 'Chờ xác nhận',
        },
      );
      // logs
      this.loggerService.log(
        `New User created with email: ${new_user.email} - role ${new_user.role}`,
      );
      return new_user;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *@function getAllUsers
   * @returns
   */

  async getAllUsers(
    pagination: PaginationParams,
    role: UserRole,
    user: IUser,
    status: UserStatus,
  ): Promise<any> {
    try {
      // filter condition
      const filters: any = {
        role: Not(UserRole.admin),
      };
      // check role
      if (user.role === UserRole.manager) {
        filters.role = Not(In([UserRole.admin, UserRole.manager]));
      }
      // check role is exist
      if (role) {
        filters.role = role;
      }
      // check role filter is admin
      if (role === UserRole.admin) {
        throw new BadRequestException('Invalid filter role');
      }
      // check role filter is manager
      if (role === UserRole.manager && user.role !== UserRole.admin) {
        throw new BadRequestException('You do not have permission');
      }
      // check status
      if (status) {
        filters.status = status;
      }

      // check search
      if (pagination.search) {
        for (let i = 0; i < pagination.search.length; i++) {
          const search = pagination.search[i];
          filters[search.field] = Like(search.value);
          if (!search.value) {
            delete filters[search.field];
          }
        }
      }
      // Get all user
      const [users, total_count] = await Promise.all([
        this.userRepository.find({
          where: filters,
          order: {
            updated_at: 'DESC',
            status: 'ASC',
            role: 'ASC',
          },
          relations: {
            task_assigned_to: {
              request: true,
            },
          },
          select: {
            user_id: true,
            avatar_url: true,
            full_name: true,
            email: true,
            phone: true,
            dob: true,
            created_at: true,
            updated_at: true,
            status: true,
            role: true,
            task_assigned_to: {
              task_id: true,
              assigned_at: true,
              request: {
                status: true,
                type: true,
                time_start: true,
                time_end: true,
              },
            },
          },
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
        }),
        this.userRepository.count({
          where: filters,
        }),
      ]);
      // get total page
      const total_page = Math.ceil(total_count / pagination.page_size);
      return {
        users,
        pagination: {
          ...pagination,
          total_page,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async findUserById(id: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          user_id: id,
        },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateStatus(id: string, status: UserStatus): Promise<any> {
    try {
      // find user
      const user = await this.userRepository.findOne({
        where: {
          user_id: id,
        },
      });
      // check user
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // update status
      user.status = status;
      // save user
      await this.userRepository.save(user);
      // check is active
      if (status === UserStatus.active) {
        // send email
        this.mailService.sendMail(
          user.email,
          SubjectMailEnum.registerWelcome,
          TemplateMailEnum.registerWelcome,
          {
            full_name: user.full_name,
            email: user.email,
            phone: user.phone,
            created_at: user.created_at.toLocaleDateString(),
            status: 'Đã xác nhận',
          },
        );
      }
      // logs
      this.loggerService.log(`User ${user.email} status has been updated to ${status}`);
      return;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListUserByRole(role: UserRole): Promise<any> {
    try {
      const users = await this.userRepository.find({
        relations: {
          service_specific: true,
        },
        where: {
          role: role,
        },
      });
      return users;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getListExpertByProcessSpecificFreeTime(): Promise<any> {
    try {
      const experts = await this.userRepository.find({
        where: {
          role: UserRole.expert,
          status: UserStatus.active,
        },
        relations: {
          expert_process_technical_specific: {
            service_specific: true,
          },
        },
      });
      // orders expert by the number of service specific
      experts.sort((a, b) => {
        return (
          a.expert_process_technical_specific.length - b.expert_process_technical_specific.length
        );
      });
      return experts;
    } catch (error) {}
  }

  /**
   * Check task of expert for free time
   * @function filterExpertFreeTime
   */

  async filterExpertFreeTime(): Promise<any> {
    try {
      const list_expert_with_task_is_pending = await this.userRepository.find({
        where: {
          role: UserRole.expert,
          request: {
            status: RequestStatus.pending,
            time_start: MoreThan(new Date()),
          },
        },
        relations: {
          request: true,
        },
      });
      // filter experts with request is lowest
      list_expert_with_task_is_pending.sort((a, b) => {
        return a.request.length - b.request.length;
      });
      return list_expert_with_task_is_pending;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Update password
   * @param email
   */

  async updatePassword(email: string): Promise<any> {
    try {
      // find user
      const user = await this.userRepository.findOne({
        where: {
          email: email,
        },
      });
      // check user
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // generate password
      const password = this.generatePassword();
      // update password
      user.password = await this.hashPassword(password);
      // save user
      await this.userRepository.save(user);
      // send mail
      this.mailService.sendMail(
        user.email,
        SubjectMailEnum.registerWelcome,
        TemplateMailEnum.registerWelcome,
        {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          password: password,
          created_at: user.created_at.toLocaleDateString(),
          status: 'Đã xác nhận',
        },
      );
      // logs
      this.loggerService.log(`User ${user.email} password has been updated`);
      return `Password has been updated for ${user.email}`;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *  Update user
   * @param userId
   * @returns user
   */

  async updateUser(userId: string, updateUserDto: any, user: IUser): Promise<User> {
    try {
      // check user role
      if (user.role === UserRole.land_renter) {
        if (user.user_id !== userId) {
          throw new ForbiddenException('You do not have permission');
        }
      }
      // find user
      const update_user = await this.userRepository.findOne({
        where: {
          user_id: userId,
        },
      });
      // check user
      if (!update_user) {
        throw new BadRequestException('User not found');
      }
      // update user
      await this.userRepository.update(
        {
          user_id: userId,
        },
        {
          ...updateUserDto,
        },
      );
      // logs
      this.loggerService.log(`User ${update_user.email} has been updated`);
      return update_user;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  private generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 8);
  }
}
