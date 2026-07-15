import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token from POST /auth/crm/login',
    example: 'eyJhbGciOiJIUzI1NiJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}