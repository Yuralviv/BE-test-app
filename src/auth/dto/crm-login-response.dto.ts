import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../database/enums/user-role.enum';

export class CrmUserProfileDto {
  @ApiProperty({ example: 'cmrcsna8b0000n260eudnhsez' })
  id: string;

  @ApiProperty({ example: 'New' })
  firstName: string;

  @ApiProperty({ example: 'User' })
  lastName: string;

  @ApiProperty({ example: 'new@motocaddy.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.MANAGER })
  role: UserRole;
}

export class CrmLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token (aud: crm, expires in 8h)',
    example:
      'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Ill1cmkuSXZhbml2QG1vdG9jYWRkeS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdWIiOiJjbXJjcndxaTA0MDAzOXd4OWNqZG5pMXY0IiwiYXVkIjoiY3JtIiwiaWF0IjoxNzgzNjcwNDEyLCJleHAiOjE3ODM2OTkyMTJ9.example',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (aud: crm-refresh, expires in 7d)',
    example:
      'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Ill1cmkuSXZhbml2QG1vdG9jYWRkeS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdWIiOiJjbXJjcndxaTA0MDAzOXd4OWNqZG5pMXY0IiwiYXVkIjoiY3JtLXJlZnJlc2giLCJpYXQiOjE3ODM2NzA0MTIsImV4cCI6MTc4NDI3NTIxMn0.example',
  })
  refreshToken: string;

  @ApiProperty({ type: CrmUserProfileDto })
  user: CrmUserProfileDto;
}

export class CrmRegistrationResponseDto extends CrmUserProfileDto {}

export class CrmRefreshResponseDto {
  @ApiProperty({
    description: 'New JWT access token (aud: crm, expires in 8h)',
    example:
      'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Ill1cmkuSXZhbml2QG1vdG9jYWRkeS5jb20iLCJyb2xlIjoiQURNSU4iLCJzdWIiOiJjbXJjcndxaTA0MDAzOXd4OWNqZG5pMXY0IiwiYXVkIjoiY3JtIiwiaWF0IjoxNzgzNjcwNDEyLCJleHAiOjE3ODM2OTkyMTJ9.example',
  })
  accessToken: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Password reset successfully' })
  message: string;
}

export class CrmLoginDataResponseDto {
  @ApiProperty({ type: CrmLoginResponseDto })
  data: CrmLoginResponseDto;
}

export class CrmRegistrationDataResponseDto {
  @ApiProperty({ type: CrmRegistrationResponseDto })
  data: CrmRegistrationResponseDto;
}

export class CrmUserProfileDataResponseDto {
  @ApiProperty({ type: CrmUserProfileDto })
  data: CrmUserProfileDto;
}

export class CrmRefreshDataResponseDto {
  @ApiProperty({ type: CrmRefreshResponseDto })
  data: CrmRefreshResponseDto;
}

export class MessageDataResponseDto {
  @ApiProperty({ type: MessageResponseDto })
  data: MessageResponseDto;
}
