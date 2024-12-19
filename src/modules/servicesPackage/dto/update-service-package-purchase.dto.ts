import { IsOptional } from 'class-validator';

export class updateServicePackagePurchaseDTO {
  @IsOptional()
  quality_plant?: number;

  @IsOptional()
  quality_plant_expect?: number;

  @IsOptional()
  mass_plant?: number;

  @IsOptional()
  mass_plant_expect?: number;
}
