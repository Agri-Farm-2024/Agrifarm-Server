import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from './types/user-role.enum';
import { UpdateStatusUserDto } from './dto/update-status-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  // @UseGuards(AuthGuard)
  // @Roles(UserRole.admin)
  @ApplyPaginationMetadata
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @Get()
  async findAll(
    @Pagination() pagination: PaginationParams,
    @Query('role') role: UserRole,
  ): Promise<any> {
    return await this.usersService.getAllUsers(pagination, role);
  }

  @Patch('/updateStatus/:id')
  async updateStatus(
    @Body('') data: UpdateStatusUserDto,
    @Param('id') id: string,
  ) {
    return await this.usersService.updateStatus(id, data.status);
  }
}
