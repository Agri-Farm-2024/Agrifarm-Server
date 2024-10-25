import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesDto {
  @ApiProperty({ type: String })
  folder: string;
}
