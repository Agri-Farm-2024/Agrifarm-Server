import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateReportProcessStandardDTO {
  @ApiProperty({
    description: 'the task id of report create process standard',
    example: 'e1b1b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b',
  })
  @IsNotEmpty()
  task_id: string;

  @ApiProperty({
    description: ' the content of report create process standard',
    example: 'this is the content of report',
  })
  @IsNotEmpty()
  content: string;
}
