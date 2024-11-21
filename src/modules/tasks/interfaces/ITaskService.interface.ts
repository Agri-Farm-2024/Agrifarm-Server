import { Payload } from 'src/modules/auths/types/payload.type';
import { RequestStatus } from 'src/modules/requests/types/request-status.enum';

export interface ITaskService {
  createTask(request_id: string): Promise<any>;

  assignTask(
    task_id: string,
    assigned_to_id: string,
    assigned_by_user: Payload,
  ): Promise<any>;

  getTasksByUserId(user_id: string, status: RequestStatus): Promise<any>;

  startTask(task_id: string, user: Payload): Promise<any>;

  approveTask(task_id: string, user: Payload): Promise<any>;

  getDetailTask(task_id: string): Promise<any>;
}
