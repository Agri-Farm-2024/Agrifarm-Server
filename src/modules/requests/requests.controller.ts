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

@ApiTags('Request')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}
}
