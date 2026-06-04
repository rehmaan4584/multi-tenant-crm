import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../../generated/prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane Member' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'jane@acme.test' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.member })
  @IsEnum(UserRole)
  role: UserRole;
}
