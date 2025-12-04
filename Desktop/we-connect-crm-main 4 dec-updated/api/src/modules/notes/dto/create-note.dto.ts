import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsString() title: string;
  @IsString() content: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsNumber() leadId: number;
  @IsNumber() createdBy: number;
}

