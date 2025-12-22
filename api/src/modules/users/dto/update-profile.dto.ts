import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const LETTERS_ONLY_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const NAME_RULE_MESSAGE =
  'must contain only letters (A-Z), no numbers or special characters, and be at least 2 characters long';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 100, {
    message: 'First name ' + NAME_RULE_MESSAGE,
  })
  @Matches(LETTERS_ONLY_REGEX, {
    message: 'First name ' + NAME_RULE_MESSAGE,
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(2, 100, {
    message: 'Last name ' + NAME_RULE_MESSAGE,
  })
  @Matches(LETTERS_ONLY_REGEX, {
    message: 'Last name ' + NAME_RULE_MESSAGE,
  })
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

}
