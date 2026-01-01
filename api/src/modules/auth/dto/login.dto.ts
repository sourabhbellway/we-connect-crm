import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsOptional
} from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Please enter a valid email address' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    // @IsString({ message: 'Password must be a string' })
    // @MinLength(8, { message: 'Password must be at least 8 characters long' })
    // @MaxLength(50, { message: 'Password cannot exceed 50 characters' })
    // @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,50}$/, {
    //   message:
    //     'Password must contain at least 1 letter and 1 number and be 8-50 characters long',
    // })
    password: string;

    @IsOptional()
    @IsString()
    fcm?: string;
}
