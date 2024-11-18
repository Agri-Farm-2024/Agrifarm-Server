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

  
}
