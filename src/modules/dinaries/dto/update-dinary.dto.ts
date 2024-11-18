import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDinaryDto } from './create-dinary.dto';

export class UpdateDinaryDto {
    @ApiProperty({
        description: 'Content of dianry',
        example: 'the stage is very good',
    })
    content: string;
    
}
