"use server";

import { signIn } from "@/auth";
import { saltAndHashPassword } from "@/lib/crypto";
import { extractSender } from "@/lib/environment";
import prisma from "@/prisma";
import { registerSchema } from "@/schemas/register.schema";
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
        hashedPassword: saltAndHashPassword(password),
        verificationToken,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return { success: "User registered successfully, " };
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

  return { success: "Email verified successfully" };
}

export async function sendVerificationEmail(email: string, token: string) {
  const client = new SESv2Client();
  const sender = extractSender();
  const verificationUrl = `${sender}/verify-email?token=${token}`;

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
              <a href="${verificationUrl}">Verify Email</a>
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
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
