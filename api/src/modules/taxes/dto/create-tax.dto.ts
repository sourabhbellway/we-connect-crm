import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaxDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    @Max(100)
    @Type(() => Number)
    rate: number;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
