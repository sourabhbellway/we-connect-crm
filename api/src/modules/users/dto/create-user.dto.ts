import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsInt,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  // Password is now optional; if omitted, the system will auto-generate
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsInt()
  managerId?: number;

  @IsArray()
  @ArrayNotEmpty({ message: 'At least one role must be selected' })
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds: number[];
}
