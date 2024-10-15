import { Injectable } from '@nestjs/common';
import { IRequestService } from './interfaces/IRequestService.interface';
import { CreateRequestViewLandDTO } from './dto/create-request-view-land.dto';

@Injectable()
export class RequestsService implements IRequestService {
  createRequestViewLand(data: CreateRequestViewLandDTO): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
