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
  Patch,
} from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessStandardDTO } from './dto/create-process-standard.dto';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import { ApplyPaginationMetadata, Pagination } from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { ProcessTechnicalStandardStatus } from './types/status-processStandard.enum';
import { UpdateProcessStandardDto } from './dto/update-process-standard-status.dto';
import { UpdateProcessStandardsDto } from './dto/update-process-standard.dto';
import { ProcessSpecificStatus } from './types/processSpecific-status.enum';
import { UPdateProcessSpecificDto } from './dto/update-process-specific.dto';

@ApiTags('Process')
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  @Post('/createProcessStandard')
  createProcessStandard(
    @Body() data: CreateProcessStandardDTO,
    @Request() request: any,
  ): Promise<any> {
    return this.processesService.createProcessStandard(data, request.user);
  }

  @Get('/getListProcessStandard')
  @UseGuards(AuthGuard)
  @Roles(UserRole.expert, UserRole.manager)
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
  getListProcessStandard(
    @Pagination() pagination: PaginationParams,
    @Query('status') status: ProcessTechnicalStandardStatus,
    @Query('plant_id') plant_id: string,
    @Request() req: any,
  ): Promise<any> {
    const user = req['user'];
    return this.processesService.getListProcessStandard(pagination, status, plant_id, user);
  }

  @Put('/updateProcessStandardStatus/:id')
  updateProcessStandardStatus(
    @Body() data: UpdateProcessStandardDto,
    @Param('id') id: string,
  ): Promise<any> {
    return this.processesService.updateProcessStandardStatus(id, data);
  }

  @Put('/updateProcessStandard/:id')
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

  @ApiQuery({
    name: 'status',
    required: false,
    enum: ProcessSpecificStatus,
  })
  @ApiQuery({
    name: 'plant_id',
    required: false,
  })
  @ApplyPaginationMetadata
  @UseGuards(AuthGuard)
  @Roles(UserRole.expert, UserRole.land_renter)
  @Get('/getListProcessSpecific')
  getListProcessSpecific(
    @Pagination() pagination: PaginationParams,
    @Query('status') status: ProcessSpecificStatus,
    @Query('plant_id') plant_id: string,
    @Request() req: any,
  ): Promise<any> {
    const user = req['user'];
    return this.processesService.getListProcessSpecific(pagination, status, plant_id, user);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  @Put('/updateProcessSpecific/:id')
  updateProcessSpecific(
    @Body() data: UPdateProcessSpecificDto,
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<any> {
    const user = req['user'];
    return this.processesService.updateProcessSpecific(id, data, user);
  }

  @Put('/updateStatusProcessSpecific/:id')
  updateStatusProcessSpecificToACtive(@Param('id') id: string): Promise<any> {
    return this.processesService.updateStatusProcessSpecificToACtive(id);
  }

  @Get('/getDetailProcessSpecific/:id')
  getProcessSpecific(@Param('id') id: string): Promise<any> {
    return this.processesService.getDetailProcessSpecific(id);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        is_public: {
          type: 'boolean',
        },
      },
    },
  })
  @Patch('/updateProcessSpecific/public/:process_specific_id')
  updateProcessSpecificPublic(
    @Param('process_specific_id') process_specific_id: string,
    @Body() data: any,
  ): Promise<any> {
    return this.processesService.updateProcessSpecificPublic(process_specific_id, data.is_public);
  }
}
