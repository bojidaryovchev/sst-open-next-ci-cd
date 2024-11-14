"use server";

import { signIn } from "@/auth";
import prisma from "@/prisma";
import { registerSchema } from "@/schemas/register.schema";
import { saltAndHashPassword } from "@/utils/crypto.utils";
import { extractSender } from "@/utils/env.utils";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { randomBytes } from "crypto";
import { AuthError } from "next-auth";

export async function registerUser(formData: FormData) {
  try {
    const { email, password } = await registerSchema.parseAsync({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const verificationToken = randomBytes(32).toString("hex");

    await prisma.user.create({
      data: {
        email,
        hashedPassword: await saltAndHashPassword(password),
        verificationToken,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return { success: "You have registered successfully, please check your inbox for a verification link" };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "An unexpected error occurred" };
  }
}

export async function verifyEmail(token: string) {
  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return { error: "Invalid verification token" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationToken: null,
    },
  });

  await signIn("credentials", {
    redirect: false,
    email: user.email,
  });

  return { success: "Email verified successfully" };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "User not found" };
  }

  if (user.emailVerified) {
    return { error: "Email is already verified" };
  }

  const verificationToken = randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken },
  });

  await sendVerificationEmail(email, verificationToken);

  return { success: "Verification email has been resent. Please check your inbox." };
}

export async function sendVerificationEmail(email: string, token: string) {
  const client = new SESv2Client();
  const sender = extractSender();

  const verificationUrl =
    process.env.NODE_ENV === "development"
      ? `http://localhost:${process.env.PORT}/verify-email?token=${token}`
      : `${sender}/verify-email?token=${token}`;

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: `noreply@${sender}`,
      Destination: {
        ToAddresses: [email],
      },
      Content: {
        Simple: {
          Subject: { Data: "Verify your email", Charset: "UTF-8" },
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: `
              <p>Click the link below to verify your email:</p>
              <a href="${verificationUrl}">Verify email</a>
              <p>If you didn't request this email, you can safely ignore it.</p>
            `,
            },
          },
        },
      },
    }),
  );
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      redirect: false,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
    return "Success";
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials";
        default:
          return error.type;
      }
    }
    throw error;
  }
}
