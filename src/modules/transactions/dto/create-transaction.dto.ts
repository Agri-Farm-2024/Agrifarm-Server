import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsFutureDate } from 'src/common/decorations/isFutureTime.decoration';
import { TransactionPurpose } from '../types/transaction-purpose.enum';

export class CreateTransactionDTO {
  @IsOptional()
  order_id: string;

  @IsOptional()
  booking_: string;

  @IsOptional()
  extend_id: string;

  @IsOptional()
  service_specific_id: string;

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
}
