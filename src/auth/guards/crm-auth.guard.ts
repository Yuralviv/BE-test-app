import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../database/enums/user-role.enum';
import { Request } from 'express';
import { verifyToken } from '../utils/jwt';

export type CrmAuthRequest = Request & {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
};

@Injectable()
export class CrmAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<CrmAuthRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const secret = this.getSecret();

    try {
      const payload = await verifyToken(token, secret, 'crm');

      if (
        payload.role !== UserRole.MANAGER &&
        payload.role !== UserRole.ADMIN
      ) {
        throw new ForbiddenException('CRM access is restricted to managers');
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractBearerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return undefined;
    }

    return header.slice('Bearer '.length).trim() || undefined;
  }

  private getSecret(): Uint8Array {
    const secret = this.config.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return new TextEncoder().encode(secret);
  }
}
