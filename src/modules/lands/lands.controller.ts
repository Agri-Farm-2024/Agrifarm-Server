import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LandsService } from './lands.service';
import { CreateLandDto } from './dto/create-land.dto';
import { UpdateLandDto } from './dto/update-land.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Land')
@Controller('lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Post()
  create(@Body() createLandDto: CreateLandDto) {
    return this.landsService.create(createLandDto);
  }

  @Get()
  findAll() {
    return this.landsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.landsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLandDto: UpdateLandDto) {
    return this.landsService.update(+id, updateLandDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.landsService.remove(+id);
  }
}
