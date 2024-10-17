import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { LoggerService } from '../../logger/logger.service';
import { RedisService } from 'src/caches/redis/redis.service';
import { MailService } from 'src/mails/mail.service';
import { IUserService } from './interfaces/IUserService.interface';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { SubjectMailEnum } from 'src/mails/types/subject.type';
import { TemplateMailEnum } from 'src/mails/types/template.type';
import { UserStatus } from './types/user-status.enum';

@Injectable()
export class UsersService implements IUserService {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async findUserByEmail(email: string) {
    try {
      const user = await this.userEntity.findOne({
        where: {
          email: email,
        },
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
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
    const user = await this.userEntity.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    // Hash the password
    const password_hash = await bcrypt.hash(createUserDto.password, 8);
    // Create a new user
    const new_user = await this.userEntity.save({
      ...createUserDto,
      password: password_hash,
    });
    // Log the user creation
    this.loggerService.log(`New User created with email: ${new_user.email}`);
    // Send a welcome email
    this.mailService.sendMail(
      new_user.email,
      SubjectMailEnum.welcome,
      TemplateMailEnum.welcome,
      {
        name: new_user.full_name,
      },
    );
    return new_user;
  }

  /**
   *@function getAllUsers
   * @returns
   */

  async getAllUsers(pagination: PaginationParams): Promise<any> {
    try {
      const filter = pagination.search.map((searchItem) => {
        // check filter empty
        if (searchItem.field === '') {
          return {
            email: Like(`%${searchItem.value}%`),
          };
        }

        return {
          [searchItem.field]: Like(`%${searchItem.value}%`),
        };
      });
      // Get all users
      const [users, total_count] = await Promise.all([
        this.userEntity.find({
          skip: (pagination.page_index - 1) * pagination.page_size,
          take: pagination.page_size,
          select: ['id', 'full_name', 'email', 'created_at', 'dob', 'role'],
          where: filter,
        }),
        this.userEntity.count({}),
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
      return await this.userEntity.findOne({
        where: {
          id: id,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateStatus(id: string, status: string): Promise<any> {
    try {
      // Find the user
      const user = await this.findUserById(id);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // Update the status
      if (status === UserStatus.pending) {
        throw new BadRequestException('Invalid status');
      }

      user.status = status;
      // Save the user
      return await this.userEntity.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
