import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { ITaskService } from './interfaces/ITaskService.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class TasksService implements ITaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskEntity: Repository<Task>,
    private readonly userSerivce: UsersService,
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
    user_id: string,
    assigned_by_id: string,
  ): Promise<any> {
    try {
      // check task exist
      const task = await this.taskEntity.findOneBy({
        id: task_id,
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      // check user exist
      const user = await this.userSerivce.findUserById(user_id);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // update task
      const updated_task = await this.taskEntity.save({
        ...task,
        assigned_by_id: assigned_by_id,
        assign_to_id: user_id,
        assigned_at: new Date(),
      });
      return updated_task;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
