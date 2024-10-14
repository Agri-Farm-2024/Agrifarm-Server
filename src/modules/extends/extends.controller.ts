import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { CreateExtendDto } from './dto/create-extend.dto';
import { UpdateExtendDto } from './dto/update-extend.dto';

@Controller('extends')
export class ExtendsController {
  constructor(private readonly extendsService: ExtendsService) {}

  @Post()
  create(@Body() createExtendDto: CreateExtendDto) {
    return this.extendsService.create(createExtendDto);
  }

  @Get()
  findAll() {
    return this.extendsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.extendsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExtendDto: UpdateExtendDto) {
    return this.extendsService.update(+id, updateExtendDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extendsService.remove(+id);
  }
}
