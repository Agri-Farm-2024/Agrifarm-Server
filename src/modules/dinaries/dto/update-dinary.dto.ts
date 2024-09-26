import { PartialType } from '@nestjs/swagger';
import { CreateDinaryDto } from './create-dinary.dto';

export class UpdateDinaryDto extends PartialType(CreateDinaryDto) {}
