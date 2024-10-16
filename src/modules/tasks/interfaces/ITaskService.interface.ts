export interface ITaskService {
  createTask(request_id: string): Promise<any>;

  assignTask(
    task_id: string,
    user_id: string,
    assigned_by_id: string,
  ): Promise<any>;
}
