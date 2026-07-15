import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

export type DeviceAuthRequest = Request & {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
};

@Injectable()
export class DeviceSecretKeyGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<DeviceAuthRequest>();
    const secretKey = this.extractBearerToken(request);

    if (!secretKey) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const user = await this.userRepo.findOne({
      where: { secretKey },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired secret key');
    }

    request.user = {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    return true;
  }

  private extractBearerToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return undefined;
    }

    return header.slice('Bearer '.length).trim() || undefined;
  }
}
