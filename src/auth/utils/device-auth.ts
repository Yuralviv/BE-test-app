import { randomBytes } from 'crypto';

export function generateSecretKey(): string {
  return randomBytes(32).toString('hex');
}

export function generateUsername(email: string): string {
  const localPart = email.split('@')[0] ?? 'user';
  const suffix = randomBytes(3).toString('hex');
  return `${localPart}_${suffix}`.slice(0, 50);
}

export function formatNextCodeSendAllowedAfter(
  verificationCodeSentAt: Date | null | undefined,
): string | null {
  if (!verificationCodeSentAt) {
    return null;
  }

  const cooldownEnds = new Date(verificationCodeSentAt.getTime() + 60_000);
  if (cooldownEnds <= new Date()) {
    return null;
  }

  const year = cooldownEnds.getFullYear().toString().slice(-2);
  const month = String(cooldownEnds.getMonth() + 1).padStart(2, '0');
  const day = String(cooldownEnds.getDate()).padStart(2, '0');
  const hours = String(cooldownEnds.getHours()).padStart(2, '0');
  const minutes = String(cooldownEnds.getMinutes()).padStart(2, '0');
  const seconds = String(cooldownEnds.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
