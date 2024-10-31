import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
export class CreateProcessStageMaterialDto {
    @ApiProperty({
        description: 'the material id',
        example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    })
    @IsNotEmpty()
    material_id: string;

    @ApiProperty({
        description: 'the quantity of the material',
        example: 10,
    })
    @IsNotEmpty()
    quantity: number;


}