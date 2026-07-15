import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../database/enums/user-role.enum';

const CRM_STAFF_ROLES = [UserRole.MANAGER, UserRole.ADMIN] as const;

export class CrmRegistrationDto {
  @ApiProperty({ example: 'new@motocaddy.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password1!', minLength: 8, maxLength: 32 })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @ApiProperty({ example: 'New' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'User' })
  @IsString()
  lastName: string;

  @ApiProperty({
    enum: CRM_STAFF_ROLES,
    example: UserRole.MANAGER,
    description: 'CRM staff role to assign. Only MANAGER or ADMIN.',
  })
  @IsIn(CRM_STAFF_ROLES, { message: 'role must be MANAGER or ADMIN' })
  role: UserRole.MANAGER | UserRole.ADMIN;
}
