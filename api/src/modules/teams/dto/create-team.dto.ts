import { IsString, IsOptional, IsInt, IsArray, IsNotEmpty } from 'class-validator';

export class CreateTeamDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsInt()
    @IsOptional()
    managerId?: number;

    @IsArray()
    @IsOptional()
    @IsInt({ each: true })
    memberIds?: number[];
}
