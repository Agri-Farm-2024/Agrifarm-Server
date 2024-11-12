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

@Controller('extends')
@ApiTags('Extends')
export class ExtendsController {
  constructor(private readonly extendsService: ExtendsService) {}
}
