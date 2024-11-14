import type { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import google from "next-auth/providers/google";
import { ZodError } from "zod";
import prisma from "./prisma";
import { signInSchema } from "./schemas/sign-in.schema";
import { verifyPassword } from "./utils/crypto.utils";

const providers: NextAuthConfig["providers"] = [
  google,
  credentials({
    credentials: {
      email: {},
      password: {},
    },
    authorize: async (credentials) => {
      try {
        const { email, password, callbackUrl } = await signInSchema.parseAsync(credentials);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const emailVerification = callbackUrl && /\/verify-email\?token=[a-zA-Z0-9]+$/g.test(callbackUrl);

        if (!emailVerification) {
          if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in");
          }

          if (!verifyPassword(user.hashedPassword, password!)) {
            return null;
          }
        }

        return user;
      } catch (error) {
        if (error instanceof ZodError) {
          return null;
        }

        if (error instanceof Error) {
          throw error;
        }

        return null;
      }
    },
  }),
];

const pages: NextAuthConfig["pages"] = {
  signIn: "/auth",
};

const callbacks: NextAuthConfig["callbacks"] = {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
    }

    return session;
  },
};

export default { providers, pages, callbacks } satisfies NextAuthConfig;
