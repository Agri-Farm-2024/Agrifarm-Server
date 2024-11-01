import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { IsFutureDate } from 'src/common/decorations/isFutureTime.decoration';

export class CreateTransactionDTO {
  @IsString()
  @IsOptional()
  order_id: string;

  @IsString()
  @IsOptional()
  booking_id: string;

  @IsString()
  @IsOptional()
  extend_id: string;

  @IsString()
  @IsOptional()
  service_specific_id: string;

  @Type(() => Date)
  @IsDate()
  @IsFutureDate()
  @IsOptional()
  expired_at: Date;
}
