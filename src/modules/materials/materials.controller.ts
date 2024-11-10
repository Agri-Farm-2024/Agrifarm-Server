import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorations/role.decoration';
import { UserRole } from '../users/types/user-role.enum';
import {
  ApplyPaginationMetadata,
  Pagination,
} from 'src/common/decorations/pagination.decoration';
import { PaginationParams } from 'src/common/decorations/types/pagination.type';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { BuyMaterialDTO } from './dto/buy-material.dto';

@ApiTags('Material')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post('/buyMaterial')
  @ApiBody({ type: [BuyMaterialDTO] })
  @UseGuards(AuthGuard)
  @Roles(UserRole.land_renter)
  buyMaterial(@Body() buyMaterialDTO: BuyMaterialDTO[], @Request() request) {
    const user = request['user'];
    return this.materialsService.buyMaterial(buyMaterialDTO, user);
  }

  @Post('/createMaterial')
  @UseGuards(AuthGuard)
  @Roles(UserRole.manager)
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.createMaterial(createMaterialDto);
  }

  @Put('/updateMaterial/:id')
  @UseGuards(AuthGuard)
  @Roles(UserRole.manager)
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.updateMaterial(id, updateMaterialDto);
  }

  @ApplyPaginationMetadata
  @Get('/getALlMaterial')
  getMaterials(@Pagination() pagination: PaginationParams): Promise<any> {
    return this.materialsService.getMaterials(pagination);
  }
}
