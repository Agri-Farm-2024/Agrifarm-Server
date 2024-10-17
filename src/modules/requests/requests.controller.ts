import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Logger,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateRequestViewLandDTO } from './dto/create-request-view-land.dto';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { RequestType } from './types/request-type.enum';
import { RequestFilterDTO } from './dto/request-filter.dto';
import { filter } from 'rxjs';

@ApiTags('Request')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('/createRequestViewLand')
  async createRequestViewLand(@Body() data: CreateRequestViewLandDTO) {
    return await this.requestsService.createRequestViewLand(data);
  }

  @Get('')
  @ApplyPaginationMetadata
  async getListRequest(
    @Pagination() pagination: PaginationParams,
    @Query() filter: RequestFilterDTO,
  ): Promise<any> {
    // Logger.log(filter);
    return await this.requestsService.getListRequest(pagination);
  }
}
