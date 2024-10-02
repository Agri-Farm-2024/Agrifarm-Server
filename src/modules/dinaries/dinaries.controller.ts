import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DinariesService } from './dinaries.service';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Dinary')
@Controller('dinaries')
export class DinariesController {
  constructor(private readonly dinariesService: DinariesService) {}

  @Post()
  create(@Body() createDinaryDto: CreateDinaryDto) {
    return this.dinariesService.create(createDinaryDto);
  }

  @Get()
  findAll() {
    return this.dinariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dinariesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDinaryDto: UpdateDinaryDto) {
    return this.dinariesService.update(+id, updateDinaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dinariesService.remove(+id);
  }
}
