import { PartialType } from '@nestjs/swagger';
import { CreateLandDto } from './create-land.dto';

export class UpdateLandDTO extends PartialType(CreateLandDto) {}
