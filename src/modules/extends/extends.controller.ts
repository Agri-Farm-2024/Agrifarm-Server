import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExtendsService } from './extends.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateExtendDto } from './dto/create-extend.dto';
import { UpdateExtendDTO } from './dto/update-extend.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';

@ApiTags('Extends')
@Controller('extends')
export class ExtendsController {
  constructor(private readonly extendsService: ExtendsService) {}

  @Post()
  async create(@Body() createExtendDto: CreateExtendDto): Promise<any> {
    return await this.extendsService.createExtend(createExtendDto);
  }

  @UseGuards(AuthGuard)
  @Roles(UserRole.manager, UserRole.land_renter, UserRole.staff)
  @Put('/:extend_id')
  async update(
    @Body() data: UpdateExtendDTO,
    @Param('extend_id') extend_id: string,
    @Request() req: any,
  ): Promise<any> {
    const user = req['user'];
    return await this.extendsService.updateExtend(data, extend_id, user);
  }
}
