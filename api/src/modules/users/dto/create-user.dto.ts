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
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  // Password is now optional; if omitted, the system will auto-generate
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

  @IsOptional()
  @IsInt({ message: 'Manager ID must be an integer' })
  managerId?: number;

  @IsArray({ message: 'Roles must be an array' })
  @ArrayNotEmpty({ message: 'At least one role must be selected' })
  @ArrayUnique({ message: 'Duplicate roles are not allowed' })
  @IsInt({ each: true, message: 'Role IDs must be integers' })
  roleIds: number[];
}
