import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class CreateNoteDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsOptional()
  @IsBoolean({ message: 'IsPinned must be a boolean' })
  isPinned?: boolean;

  @IsNumber({}, { message: 'Lead ID must be a number' })
  @IsNotEmpty({ message: 'Lead ID is required' })
  leadId: number;

  @IsNumber({}, { message: 'Creator ID must be a number' })
  @IsNotEmpty({ message: 'Creator ID is required' })
  createdBy: number;
}
