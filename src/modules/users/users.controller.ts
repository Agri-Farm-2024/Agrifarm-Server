import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { ApplyPaginationMetadata, Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { UserRole } from './types/user-role.enum';
import { UpdateStatusUserDto } from './dto/update-status-user.dto';
import { UserStatus } from './types/user-status.enum';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.admin, UserRole.manager)
  @ApplyPaginationMetadata
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @Get()
  async findAll(
    @Pagination() pagination: PaginationParams,
    @Query('role') role: UserRole,
    @Query('status') status: UserStatus,
    @Request() req: any,
  ): Promise<any> {
    const user = req['user'];
    return await this.usersService.getAllUsers(pagination, role, user, status);
  }

  @Patch('/updateStatus/:id')
  async updateStatus(@Body('') data: UpdateStatusUserDto, @Param('id') id: string) {
    return await this.usersService.updateStatus(id, data.status);
  }
}
