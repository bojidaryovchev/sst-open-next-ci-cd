import crypto from "crypto";
import speakeasy from "speakeasy";

export function generateSecret(): string {
  return speakeasy.generateSecret({ length: 32 }).base32;
}

export function verifyToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });
}

export function generateBackupCodes(count: number = 8): string[] {
  return Array.from({ length: count }, () => crypto.randomBytes(4).toString("hex"));
}
