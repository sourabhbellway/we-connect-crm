import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ListMessagesQuery {
  @IsOptional() @IsNumberString() leadId?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;
}
