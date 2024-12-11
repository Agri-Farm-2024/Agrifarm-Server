import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateServicePackageDTO } from './create-service-package.dto';
import { ServicePackageStatus } from '../types/service-package-status.enum';
import { IsOptional } from 'class-validator';

export class updateServicePackageDTO extends PartialType(CreateServicePackageDTO) {
  @ApiProperty({
    enum: ServicePackageStatus,
    example: ServicePackageStatus.active,
    required: false,
  })
  @IsOptional()
  status: ServicePackageStatus;
}
