import { Controller, Get, Post, Body, Param, UseGuards, Put } from '@nestjs/common';
import { DinariesService } from './dinaries.service';
import { CreateDinaryDto } from './dto/create-dinary.dto';
import { UpdateDinaryDto } from './dto/update-dinary.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UserRole } from '../users/types/user-role.enum';
import { Roles } from 'src/common/decorations/role.decoration';

@ApiTags('Dinary')
@Controller('dinaries')
export class DinariesController {
  constructor(private readonly dinariesService: DinariesService) {}

  @Post('/:process_specific_stage_content_id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  createDinaryStage(
    @Body() createDinaryDto: CreateDinaryDto,
    @Param('process_specific_stage_content_id')
    process_stage_content_id: string,
  ) {
    return this.dinariesService.createDinary(createDinaryDto, process_stage_content_id);
  }

  @Put('/:dinary_stage_id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.expert)
  updateDinaryStage(
    @Body() updateDinaryDto: UpdateDinaryDto,
    @Param('dinary_stage_id') id: string,
  ) {
    return this.dinariesService.updateDinary(updateDinaryDto, id);
  }

  @Get('/:process_technical_specific_id')
  getDinaryStageByProcessSpecificId(
    @Param('process_technical_specific_id') process_specific_id: string,
  ) {
    return this.dinariesService.getDinaryStageByProcessSpecificId(process_specific_id);
  }
}
