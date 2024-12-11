import { Controller, Get, UseGuards, Request, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiTags } from '@nestjs/swagger';
import { ApplyPaginationMetadata, Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { IUser } from '../auths/interfaces/IUser.interface';

@ApiTags('Notification')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApplyPaginationMetadata
  @UseGuards(AuthGuard)
  @Get()
  async getByUser(@Pagination() pagination: PaginationParams, @Request() req: any) {
    const user: IUser = req['user'];
    return await this.notificationsService.getListByUser(user.user_id, pagination);
  }

  @Patch('/seen')
  @UseGuards(AuthGuard)
  async seen(@Request() req: any) {
    const user: IUser = req['user'];
    return await this.notificationsService.seen(user.user_id);
  }
}
