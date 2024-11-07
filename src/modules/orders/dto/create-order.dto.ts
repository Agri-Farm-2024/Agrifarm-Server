import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
    @ApiProperty({
        description: 'The id of the land renter',
        
    })
    landrenter_id: string;
}
