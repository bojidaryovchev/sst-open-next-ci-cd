"use server";

import { auth } from "@/auth";
import { generateBackupCodes, generateSecret, verifyToken } from "@/lib/2fa";
import prisma from "@/prisma";

export async function setup2FA() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.twoFactorEnabled) {
    throw new Error("2FA is already enabled");
  }

  const secret = generateSecret();
  const backupCodes = generateBackupCodes();
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(user.email!)}?secret=${secret}&issuer=YourAppName`;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
      twoFactorEnabled: true,
    },
  });

  return { otpauthUrl, backupCodes };
}

export async function verify2FA(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const token = formData.get("token") as string;
  if (!token) {
    return { error: "Invalid token" };
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.twoFactorSecret) {
    throw new Error("User not found or 2FA not set up");
  }

  const isValid = verifyToken(user.twoFactorSecret, token);

  if (!isValid) {
    return { error: "Invalid token" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorVerified: true },
  });

  return { success: true };
}
