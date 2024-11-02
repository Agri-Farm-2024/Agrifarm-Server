import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Role } from 'discord.js';
import { Roles } from 'src/common/decorations/role.decoration';
import exp from 'constants';
import { UserRole } from '../users/types/user-role.enum';
import { GetProcessStandardResponse } from './interfaces/IProcessesService.interface';

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

  // @Roles(UserRole.expert, UserRole.manager)
  @Get('/getProcessStandard')
  getProcessStandard(): Promise<GetProcessStandardResponse> {
    return this.processesService.getProcessStandard();
  }
}
