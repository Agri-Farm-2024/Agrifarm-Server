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
  UseGuards,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRequestViewLandDTO } from './dto/create-request-view-land.dto';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { RequestType } from './types/request-type.enum';
import { CreateRequestProcessStandardDTO } from './dto/create-request-processStandard.dto';
import { RequestStatus } from './types/request-status.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import { UpdateStatusTaskDTO } from './dto/update-status-task.dto';

@ApiTags('Request')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post('/createRequestViewLand')
  async createRequestViewLand(@Body() data: CreateRequestViewLandDTO) {
    return await this.requestsService.createRequestViewLand(data);
  }

  @Post('/createRequestProcessStandard')
  async createRequestProcessStandard(
    @Body() data: CreateRequestProcessStandardDTO,
  ) {
    return await this.requestsService.createRequestProcessStandard(data);
  }

  @Get('/getListRequest')
  @ApplyPaginationMetadata
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'type', required: false, enum: RequestType })
  async getListRequest(
    @Pagination() pagination: PaginationParams,
    @Query('status') status: RequestStatus,
    @Query('type') type: RequestType,
  ): Promise<any> {
    // Logger.log(filter);
    return await this.requestsService.getListRequest(pagination, status, type);
  }

  @Get(':request_id')
  async getDetailRequest(
    @Param('request_id') request_id: string,
  ): Promise<any> {
    return await this.requestsService.getDetailRequest(request_id);
  }

  @Get('/getDetailRequestPrcocessStandard/:plant_season_id')
  async getDetailRequestPrcocessStandard(
    @Param('plant_season_id') plant_season_id: string,
  ): Promise<any> {
    return await this.requestsService.getDetailRequestPrcocessStandard(
      plant_season_id,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.manager, UserRole.staff)
  @Patch('/confirmRequest/:request_id')
  async updateRequest(
    @Param('request_id') request_id: string,
    @Body() data: UpdateStatusTaskDTO,
  ): Promise<any> {
    return await this.requestsService.confirmRequest(request_id, data);
  }
}
