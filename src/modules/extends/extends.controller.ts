import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateExtendDto } from './dto/create-extend.dto';

@ApiTags('Extends')
@Controller('extends')
export class ExtendsController {
  constructor(private readonly extendsService: ExtendsService) {}

  @Post()
  async create(@Body() createExtendDto: CreateExtendDto): Promise<any> {
    return await this.extendsService.createExtend(createExtendDto);
  }
}
