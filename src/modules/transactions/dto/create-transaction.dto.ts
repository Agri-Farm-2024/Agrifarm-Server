import { IsOptional, IsString } from 'class-validator';

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

  service_specific_id: string;

  expired_at: Date;
}
