import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateRequestViewLandDTO } from './dto/create-request-view-land.dto';

@ApiTags('Request')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('/createRequestViewLand')
  createRequestViewLand(@Body() data: CreateRequestViewLandDTO) {
    return this.requestsService.createRequestViewLand(data);
  }
}
