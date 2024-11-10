import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ProcessTechnicalStandardStatus } from './types/status-processStandard.enum';
import { UpdateProcessStandardDto } from './dto/update-processStandardStatus.dto';
import { createProcessSpecificDTO } from './dto/create-process-specific.dto';
import { UpdateProcessStandardsDto } from './dto/update-process-standard.dto';
import { ProcessSpecificStatus } from './types/processSpecific-status.enum';

@ApiTags('Process')
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  @Post('/createProcessStandard')
  createProcessStandard(
    @Body() data: CreateProcessDto,
    @Request() request: any,
  ): Promise<any> {
    return this.processesService.createProcessStandard(data, request.user);
  }

  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProcessTechnicalStandardStatus,
  })
  @ApiQuery({
    name: 'plant_id',
    required: false,
  })
  @ApplyPaginationMetadata
  @Get('/getListProcessStandard')
  getListProcessStandard(
    @Pagination() pagination: PaginationParams,
    @Query('status') status: ProcessTechnicalStandardStatus,
    @Query('plant_id') plant_id: string,
  ): Promise<any> {
    return this.processesService.getListProcessStandard(
      pagination,
      status,
      plant_id,
    );
  }

  @Put('/updateProcessStandardStatus/:id')
  updateProcessStandardStatus(
    @Body() data: UpdateProcessStandardDto,
    @Param('id') id: string,
  ): Promise<any> {
    return this.processesService.updateProcessStandardStatus(id, data);
  }

  @Put('/updateProcessStanrd/:id')
  updateProcessStandard(
    @Body() data: UpdateProcessStandardsDto,
    @Param('id') id: string,
  ): Promise<any> {
    return this.processesService.updateProcessStandard(id, data);
  }

  @Delete('/deleteProcessStandard/:id')
  async removeProcessStandard(@Param('id') id: string): Promise<any> {
    return this.processesService.removeProcessStandard(id);
  }

  @Get('/getListProcessSpecific')
  @ApplyPaginationMetadata
  getListProcessSpecific(
    @Pagination() pagination: PaginationParams,
    @Query('status') status: ProcessSpecificStatus,
    @Query('plant_id') plant_id: string,
  ): Promise<any> {
    return this.processesService.getListProcessSpecific(
      pagination,
      status,
      plant_id,
    );
  }
}
