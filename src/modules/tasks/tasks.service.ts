import {
  BadRequestException,
  ForbiddenException,
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
import { IUser } from '../auths/types/IUser.interface';
import { RequestStatus } from '../requests/types/request-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationTitleEnum } from '../notifications/types/notification-title.enum';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { NotificationContentEnum } from '../notifications/types/notification-content.enum';
import { ChannelsService } from '../channels/channels.service';
import { RequestType } from '../requests/types/request-type.enum';
import { RequestSupportType } from '../requests/types/request-support-type.enum';
import { selectUser } from 'src/utils/select.util';

@Injectable()
export class TasksService implements ITaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskEntity: Repository<Task>,

    private readonly userSerivce: UsersService,

    @Inject(forwardRef(() => RequestsService))
    private readonly requestSerivce: RequestsService,

    private readonly notificationService: NotificationsService,

    private readonly channelService: ChannelsService,
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

  async createTaskAuto(
    request_id: string,
    assigned_to_id: string,
  ): Promise<any> {
    try {
      // Create a new task
      const new_task = await this.taskEntity.save({
        request_id,
        assigned_to_id,
        assigned_at: new Date(),
      });
      // send notification to assigned user
      await this.notificationService.createNotification({
        user_id: assigned_to_id,
        title: NotificationTitleEnum.create_task,
        content: NotificationContentEnum.assigned_task(),
        type: NotificationType.task,
        component_id: new_task.task_id,
      });
      return new_task;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async assignTask(
    task_id: string,
    assigned_to_id: string,
    assigned_by_user: IUser,
  ): Promise<any> {
    try {
      // check task exist
      const task = await this.taskEntity.findOne({
        where: {
          task_id: task_id,
        },
        relations: {
          request: true,
        },
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      // check user exist
      const user = await this.userSerivce.findUserById(assigned_to_id);
      if (!user) {
        throw new BadRequestException('User not found');
      }
      // check type of request
      // if (
      //   task.request.type === RequestType.technical_support &&
      //   task.request.support_type === RequestSupportType.chat
      // ) {
      //   // join message for assigned user
      //   await this.channelService.addAssignToChannel(
      //     task.request_id,
      //     assigned_to_id,
      //   );
      // }
      // update task
      const updated_task = await this.taskEntity.save({
        ...task,
        assigned_by_id: assigned_by_user.user_id,
        assigned_to_id: assigned_to_id,
        assigned_at: new Date(),
      });
      // update request status to assigned
      await this.requestSerivce.updateRequestStatus(
        task.request_id,
        RequestStatus.assigned,
      );
      // send notification to assigned user
      await this.notificationService.createNotification({
        user_id: assigned_to_id,
        title: NotificationTitleEnum.create_task,
        content: NotificationContentEnum.assigned_task(),
        type: NotificationType.task,
        component_id: task_id,
      });
      return updated_task;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get tasks by staff or expert
   * @function getTasksByUserId
   * @param user_id
   * @param status
   * @returns
   */

  async getTasksByUserId(user_id: string, status: RequestStatus): Promise<any> {
    try {
      const filter: any = {};
      filter.assigned_to_id = user_id;
      if (status) {
        filter.request = {};
        filter.request.status = status;
      }

      const tasks = await this.taskEntity.find({
        where: filter,
        relations: {
          request: {
            plant_season: {
              plant: true,
            },
            service_specific: {
              booking_land: {
                land: true,
              },
            },
            process_technical_specific_stage: true,
            process_technical_specific_stage_content: {
              process_technical_specific_stage: {
                process_technical_specific: {
                  service_specific: {
                    booking_land: {
                      land: true,
                    },
                  },
                },
              },
            },
            booking_land: {
              land: true,
            },
          },
          assign_by: true,
        },
        select: {
          assign_by: selectUser,
        },
        order: {
          request: {
            updated_at: 'DESC',
          },
        },
      });
      // console.log(tasks);
      return tasks;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async startTask(task_id: string, user: IUser): Promise<any> {
    try {
      // check task exist
      const task = await this.taskEntity.findOne({
        where: { task_id: task_id },
        relations: {
          request: true,
        },
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      // check user is assigned to task
      if (task.assigned_to_id !== user.user_id) {
        throw new ForbiddenException('Task not assigned to you');
      }
      // check request status
      if (
        task.request.status !== RequestStatus.assigned &&
        task.request.status !== RequestStatus.rejected
      ) {
        throw new BadRequestException('Request not assigned or rejected');
      }
      // Check type of request
      if (
        task.request.type === RequestType.technical_support &&
        task.request.support_type === RequestSupportType.chat
      ) {
        const new_channel = await this.channelService.createChannel({
          request_id: task.request_id,
          sender_id: task.request.sender_id,
          expert_id: task.assigned_to_id,
        });
        // send notification to sender
        await this.notificationService.createNotification({
          user_id: task.request.sender_id,
          title: NotificationTitleEnum.create_chat,
          content: NotificationContentEnum.create_chat(
            task.request.description,
          ),
          type: NotificationType.channel,
          component_id: new_channel.channel_id,
        });
      }
      // update request status
      const updated_request = await this.requestSerivce.updateRequestStatus(
        task.request_id,
        RequestStatus.in_progress,
      );
      return updated_request;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async approveTask(task_id: string, user: IUser): Promise<any> {
    try {
      // check task exist
      const task = await this.taskEntity.findOne({
        where: { task_id: task_id },
        relations: {
          request: true,
        },
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      // check user is assigned to task
      if (task.assigned_to_id !== user.user_id) {
        throw new ForbiddenException('Task not assigned to you');
      }
      // check request status
      if (task.request.status !== RequestStatus.in_progress) {
        throw new BadRequestException('Request not in progress');
      }
      // update request status
      const updated_request = await this.requestSerivce.updateRequestStatus(
        task.request_id,
        RequestStatus.pending_approval,
      );
      return updated_request;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async getDetailTask(task_id: string): Promise<any> {
    try {
      const task = await this.taskEntity.findOne({
        where: { task_id: task_id },
        relations: {
          request: {
            plant_season: {
              plant: true,
            },
          },
          assign_by: true,
          assign_to: true,
        },
      });
      if (!task) {
        throw new BadRequestException('Task not found');
      }
      return task;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
