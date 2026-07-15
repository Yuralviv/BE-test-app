import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../database/enums/user-role.enum';

export class AdminUserDto {
  @ApiProperty({ example: 'cmrcsna8b0000n260eudnhsez' })
  id: string;

  @ApiProperty({ example: 'new@motocaddy.com' })
  email: string;

  @ApiProperty({ example: 'New' })
  firstName: string;

  @ApiProperty({ example: 'User' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  role: UserRole;
}

export class AdminListResponseDto {
  @ApiProperty({ type: [AdminUserDto] })
  admins: AdminUserDto[];

  @ApiProperty({ example: 2 })
  total: number;
}
