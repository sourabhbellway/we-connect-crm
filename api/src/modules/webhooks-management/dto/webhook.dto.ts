import { IsString, IsUrl, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';

export class CreateWebhookDto {
    @IsString()
    name: string;

    @IsUrl()
    url: string;

    @IsArray()
    @IsOptional()
    events?: string[];

    @IsString()
    @IsOptional()
    secret?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateWebhookDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsUrl()
    @IsOptional()
    url?: string;

    @IsArray()
    @IsOptional()
    events?: string[];

    @IsString()
    @IsOptional()
    secret?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
