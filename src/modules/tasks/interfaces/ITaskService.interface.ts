import { IUser } from 'src/modules/auths/interfaces/IUser.interface';
import { RequestStatus } from 'src/modules/requests/types/request-status.enum';

export interface ITaskService {
  createTask(request_id: string): Promise<any>;

  assignTask(
    task_id: string,
    assigned_to_id: string,
    assigned_by_user: IUser,
  ): Promise<any>;

  getTasksByUserId(user_id: string, status: RequestStatus): Promise<any>;

  startTask(task_id: string, user: IUser): Promise<any>;

  approveTask(task_id: string, user: IUser): Promise<any>;

  getDetailTask(task_id: string): Promise<any>;
}
