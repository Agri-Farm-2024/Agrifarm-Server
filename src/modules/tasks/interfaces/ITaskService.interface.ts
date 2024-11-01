import { Payload } from 'src/modules/auths/types/payload.type';

export interface ITaskService {
  createTask(request_id: string): Promise<any>;

  assignTask(
    task_id: string,
    assigned_to_id: string,
    assigned_by_user: Payload,
  ): Promise<any>;

  getTasksByUserId(user_id: string): Promise<any>;
  updateTaskStatus(task_id: string, status: string): Promise<any>;
}
