import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AssignTaskDto } from './dto/assign-task.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import { RequestStatus } from '../requests/types/request-status.enum';

@ApiTags('Task')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(AuthGuard)
  @Roles(UserRole.admin, UserRole.manager, UserRole.staff)
  @Put('/assign/:task_id')
  assignTask(
    @Param('task_id') task_id: string,
    @Body() data: AssignTaskDto,
    @Request() request: any,
  ) {
    return this.tasksService.assignTask(task_id, data.assigned_to_id, request.user);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.staff, UserRole.expert)
  @Patch('/start/:task_id')
  startTask(@Param('task_id') task_id: string, @Request() request: any) {
    return this.tasksService.startTask(task_id, request.user);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.staff, UserRole.expert)
  @Patch('/pendingApprove/:task_id')
  approveTask(@Param('task_id') task_id: string, @Request() request: any) {
    return this.tasksService.approveTask(task_id, request.user);
  }

  @UseGuards(AuthGuard)
  @ApiQuery({
    name: 'status',
    enum: RequestStatus,
    required: false,
  })
  @Get('/getByUser')
  async getTasksByUserId(@Request() request: any, @Query('status') status: RequestStatus) {
    const user = request['user'];
    return await this.tasksService.getTasksByUserId(user.user_id, status);
  }
}
