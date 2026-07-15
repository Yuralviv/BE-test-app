import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/enums/user-role.enum';
import { isUniqueViolation } from '../database/utils/is-unique-violation';
import { CrmRegistrationDto } from './dto/crmRegistration.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from 'src/customers/utils/hash-password';
import { signCrmAccessToken, signCrmRefreshToken, verifyToken } from './utils/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async crmRegistration(data: CrmRegistrationDto) {
    try {
      const user = await this.userRepo.save({
        email: data.email,
        password: hashPassword(data.password),
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `User with email ${data.email} already exists`,
        );
      }
      throw error;
    }
  }

  async crmLogin(data: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    const secret = this.getSecret();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!verifyPassword(data.password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role === UserRole.CUSTOMER) {
      throw new ForbiddenException('CRM access is restricted to managers');
    }

    const accessToken = await signCrmAccessToken(
      { id: user.id, email: user.email, role: user.role },
      secret,
    );
    const refreshToken = await signCrmRefreshToken(
      { id: user.id, email: user.email, role: user.role },
      secret,
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async crmMe(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
  }

  async crmResetPassword(userId: string, data: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!verifyPassword(data.currentPassword, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.userRepo.update(userId, {
      password: hashPassword(data.newPassword),
    });

    return { message: 'Password reset successfully' };
  }

  async crmRefresh(data: RefreshTokenDto) {
    const secret = this.getSecret();

    let payload;
    try {
      payload = await verifyToken(data.refreshToken, secret, 'crm-refresh');
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload.role) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.role === UserRole.CUSTOMER) {
      throw new ForbiddenException('CRM access is restricted to managers');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = await signCrmAccessToken(
      { id: user.id, email: user.email, role: user.role },
      secret,
    );

    return { accessToken };
  }

  private getSecret(): Uint8Array {
    const secret = this.config.get<string>('jwt.secret');
    return new TextEncoder().encode(secret);
  }
}
