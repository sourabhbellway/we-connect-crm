import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateCurrencyDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @IsString()
    @IsNotEmpty()
    symbol: string;

    @IsNumber()
    @IsOptional()
    exchangeRate?: number;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
