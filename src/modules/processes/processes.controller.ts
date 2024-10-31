import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Process')
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Post('/createProcessStandard')
  createProcessStandard(@Body() data: CreateProcessDto) {
    return this.processesService.createProcessStandard(data);
  }

  
}
