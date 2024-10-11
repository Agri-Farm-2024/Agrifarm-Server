import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { LoggerService } from '../../logger/logger.service';
import { RedisService } from 'src/caches/redis/redis.service';
import { MailService } from 'src/mails/mail.service';
import { IUserService } from './interfaces/IUserService.interface';

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
    return await this.userEntity.findOne({
      where: {
        email: email,
      },
    });
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
    this.mailService.sendMail(new_user.email, new_user.full_name);
    return new_user;
  }

  /**
   *@function getAllUsers
   * @returns
   */

  async getAllUsers(page_size: number, page_index: number): Promise<any> {
    // Get all users
    const [users, total_count] = await Promise.all([
      this.userEntity.find({
        skip: (page_index - 1) * page_size,
        take: page_size,
        select: ['id', 'full_name', 'email', 'created_at'],
      }),
      this.userEntity.count({}),
    ]);
    // get total page
    const total_page = Math.ceil(total_count / page_size);
    return {
      users,
      total_page,
      page_index,
      page_size,
    };
  }
}
