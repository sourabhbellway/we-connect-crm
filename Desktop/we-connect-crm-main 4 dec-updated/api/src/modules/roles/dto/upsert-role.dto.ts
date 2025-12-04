import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleAccessScope } from '@prisma/client';

export class UpsertRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoleAccessScope, { message: 'accessScope must be OWN or GLOBAL' })
  accessScope: RoleAccessScope;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsArray()
  @ArrayNotEmpty({ message: 'permissionIds must contain at least one id' })
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  permissionIds: number[];
}
