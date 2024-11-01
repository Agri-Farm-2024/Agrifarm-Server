import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Process')
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @UseGuards(AuthGuard)
  @Post('/createProcessStandard')
  createProcessStandard(@Body() data: CreateProcessDto,@Request() request: any): Promise<any> {
    return this.processesService.createProcessStandard(data,request.user);
  }

  
}
