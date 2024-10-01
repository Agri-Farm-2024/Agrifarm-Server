import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from 'src/caches/redis/redis.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
    private readonly loggerService: LoggerService,
    private readonly redisService: RedisService,
  ) {}

  /**
   *
   * @param createUserDto
   * @logic
   * 1. Check email is already exists
   * 2. Hash the password
   * 3. Create a new user
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
    // Save the user to Redis
    await this.redisService.set(new_user.email, JSON.stringify(new_user));
    return new_user;
  }
}
