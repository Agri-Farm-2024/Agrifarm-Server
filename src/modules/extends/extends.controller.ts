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

@ApiTags('Extends')
@Controller('extends')
export class ExtendsController {
  constructor(private readonly extendsService: ExtendsService) {}
}
