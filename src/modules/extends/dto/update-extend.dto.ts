import { PartialType } from '@nestjs/swagger';
import { CreateExtendDto } from './create-extend.dto';

export class UpdateExtendDto extends PartialType(CreateExtendDto) {}
