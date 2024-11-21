import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getDashboardData() {
    return {
      message: 'Welcome to the dashboard!',
    };
  }
}
