import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Request,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiTags } from '@nestjs/swagger';
import { AssignTaskDto } from './dto/assign-task.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';

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
    return this.tasksService.assignTask(
      task_id,
      data.assigned_to_id,
      request.user,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/getByUser')
  getTasksByUserId(@Request() request: any) {
    return this.tasksService.getTasksByUserId(request.user.id);
  }
}
