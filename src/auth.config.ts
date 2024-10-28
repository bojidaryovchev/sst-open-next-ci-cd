import type { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import google from "next-auth/providers/google";
import { ZodError } from "zod";
import { verifyPassword } from "./lib/crypto";
import prisma from "./prisma";
import { signInSchema } from "./schemas/sign-in.schema";

const providers: NextAuthConfig["providers"] = [
  google,
  credentials({
    credentials: {
      email: {},
      password: {},
      isEmailVerification: {},
    },
    authorize: async (credentials) => {
      try {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> credentials");
        console.log(credentials);

        const { email, password, isEmailVerification } = await signInSchema.parseAsync(credentials);

        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> {email, password, isEmailVerification}");
        console.log({email, password, isEmailVerification});

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        // Skip password check if it's an email verification login
        if (!isEmailVerification) {
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
