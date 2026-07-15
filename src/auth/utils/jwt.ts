import { UserRole } from '../../database/enums/user-role.enum';
import { SignJWT, jwtVerify } from 'jose';

export type TokenAudience = 'crm' | 'crm-refresh';

export type VerifiedToken = {
  sub: string;
  email: string;
  role?: UserRole;
  aud: TokenAudience;
};

export async function signCrmToken(
  user: { id: string; email: string; role: UserRole },
  secret: Uint8Array,
): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setAudience('crm')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyToken(
  token: string,
  secret: Uint8Array,
  audience: TokenAudience,
): Promise<VerifiedToken> {
  const { payload } = await jwtVerify(token, secret, { audience });

  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
    throw new Error('Invalid token payload');
  }

  const role =
    typeof payload.role === 'string' &&
    (['CUSTOMER', 'MANAGER', 'ADMIN'] as const).includes(
      payload.role as UserRole,
    )
      ? (payload.role as UserRole)
      : undefined;

  return {
    sub: payload.sub,
    email: payload.email,
    role,
    aud: audience,
  };
}


export async function signCrmAccessToken(
  user: { id: string; email: string; role: UserRole },
  secret: Uint8Array,
): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setAudience('crm')
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function signCrmRefreshToken(
  user: { id: string; email: string; role: UserRole },
  secret: Uint8Array,
): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setAudience('crm-refresh')
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}