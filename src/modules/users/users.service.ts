import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { In, Like, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { LoggerService } from '../../logger/logger.service';
import { RedisService } from 'src/caches/redis/redis.service';
import { MailService } from 'src/mails/mail.service';
import { IUserService } from './interfaces/IUserService.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { SubjectMailEnum } from 'src/mails/types/mail-subject.type';
import { TemplateMailEnum } from 'src/mails/types/mail-template.type';
import { UserStatus } from './types/user-status.enum';
import { UserRole } from './types/user-role.enum';
import { Payload } from '../auths/types/payload.type';

@Injectable()
export class UsersService implements IUserService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly loggerService: LoggerService,

    private readonly redisService: RedisService,

    private readonly mailService: MailService,
  ) {}

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
  async create(createUserDto: CreateUserDto) {
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
    const password = Math.random().toString(36).slice(-8);
    // Hash the password
    const password_hash = await bcrypt.hash(password, 8);
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
    return new_user;
  }

  /**
   *@function getAllUsers
   * @returns
   */

  async getAllUsers(
    pagination: PaginationParams,
    role: UserRole,
    user: Payload,
  ): Promise<any> {
    try {
      // filter condition
      const filters: any = {
        role: Not(UserRole.admin),
      };
      // check role
      if (user.role === UserRole.manager) {
        filters.role = Not(In[(UserRole.admin, UserRole.manager)]);
      }
      // check role filter
      if (role !== UserRole.manager && role !== UserRole.admin) {
        filters.role = role;
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
            password: '********',
            created_at: user.created_at.toLocaleDateString(),
            status: 'Đã xác nhận',
          },
        );
      }
      return;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
