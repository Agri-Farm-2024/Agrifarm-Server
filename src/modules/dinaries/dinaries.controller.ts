import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DinariesService } from './dinaries.service';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/types/user-role.enum';
import { Role } from 'discord.js';
import { Roles } from 'src/common/decorations/role.decoration';

@ApiTags('Dinary')
@Controller('dinaries')
export class DinariesController {
  constructor(private readonly dinariesService: DinariesService) {}

  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  @Post('/:process_specific_stage_content_id')
  createDinaryStage(
    @Body() createDinaryDto: CreateDinaryDto,
    @Param('process_specific_stage_content_id')
    process_stage_content_id: string,
  ) {
    return this.dinariesService.createDinary(
      createDinaryDto,
      process_stage_content_id,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  @Patch('/:dinary_stage_id')
  updateDinaryStage(
    @Body() updateDinaryDto: UpdateDinaryDto,
    @Param('dinary_stage_id') id: string,
  ) {
    return this.dinariesService.updateDinary(updateDinaryDto, id);
  }
}
