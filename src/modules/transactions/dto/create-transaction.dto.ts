import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { IsFutureDate } from 'src/common/decorations/isFutureTime.decoration';
import { TransactionPurpose } from '../types/transaction-purpose.enum';
import { TransactionType } from '../types/transaction-type.enum';

export class CreateTransactionDTO {
  @IsOptional()
  order_id: string;

  @IsOptional()
  booking_land_id: string;

  @IsOptional()
  booking_material_id: string;

  @IsOptional()
  extend_id: string;

  @IsOptional()
  service_specific_id: string;

  @IsNotEmpty()
  user_id: string;

  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  @IsOptional()
  expired_at: Date;

  @IsNotEmpty()
  total_price: number;

  @IsNotEmpty()
  @IsEnum(TransactionPurpose) // Validate that purpose is a valid enum value
  purpose: TransactionPurpose;

  @IsOptional()
  @IsEnum(TransactionType) // Validate that type is a valid enum value
  type: TransactionType;
}
