import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  usuario?: string;

  @IsString()
  @MinLength(10)
  @IsOptional()
  telefono?: string;

  @IsEmail({}, { message: 'El email debe ser valido' })
  @IsOptional()
  email?: string;

  @IsIn(Object.values(UserRole))
  @IsOptional()
  role?: UserRole;
}
