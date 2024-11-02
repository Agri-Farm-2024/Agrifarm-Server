import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { ITaskService } from './interfaces/ITaskService.interface';
import { UsersService } from '../users/users.service';
import { RequestsService } from '../requests/requests.service';
import { Payload } from '../auths/types/payload.type';
import { TaskStatus } from './types/task-status.enum';
import { RequestStatus } from '../requests/types/request-status.enum';

@Injectable()
export class TasksService implements ITaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskEntity: Repository<Task>,

    private readonly userSerivce: UsersService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestSerivce: RequestsService,
  ) {}

  async createTask(request_id: string): Promise<any> {
    try {
      // Create a new task
      const new_task = this.taskEntity.save({ request_id });
      return new_task;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async assignTask(
    task_id: string,
    assigned_to_id: string,
    assigned_by_user: Payload,
  ): Promise<any> {
    try {
      // check task exist
      const task = await this.taskEntity.findOneBy({
        task_id: task_id,
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      // check user exist
      const user = await this.userSerivce.findUserById(assigned_to_id);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // update task
      const updated_task = await this.taskEntity.save({
        ...task,
        assigned_by_id: assigned_by_user.user_id,
        assigned_to_id: assigned_to_id,
        assigned_at: new Date(),
        status: TaskStatus.in_process,
      });
      // update request status to assigned
      await this.requestSerivce.updateRequestStatus(
        task.request_id,
        RequestStatus.assigned,
      );
      return updated_task;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getTasksByUserId(user_id: string): Promise<any> {
    try {
      const tasks = await this.taskEntity.find({
        where: { assigned_to_id: user_id },
        relations: {
          request: true,
          assign_by: true,
        },
        select: {
          assign_by: {
            user_id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
        order: { created_at: 'DESC' },
      });
      return tasks;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  //update task status
  async updateTaskStatus(task_id: string, status: TaskStatus): Promise<any> {
    try {
      // check task exist
      const task = await this.taskEntity.findOne({
        where: {
          task_id: task_id,
        },
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      // update task status
      const updated_task = await this.taskEntity.save({
        ...task,
        status,
      });

      return updated_task;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
