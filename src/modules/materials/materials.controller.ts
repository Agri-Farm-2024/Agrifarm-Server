import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Material')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // @Post()
  // create(@Body() createMaterialDto: CreateMaterialDto) {
  //   return this.materialsService.create(createMaterialDto);
  // }

}
