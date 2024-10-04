import type { NextAuthConfig } from "next-auth";
import credentials from "next-auth/providers/credentials";
import google from "next-auth/providers/google";
import { ZodError } from "zod";
import { saltAndHashPassword, verifyPassword } from "./lib/crypto";
import { signInSchema } from "./lib/zod";
import prisma from "./prisma";

export default {
  providers: [
    google,
    credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);

          let user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                hashedPassword: saltAndHashPassword(password),
              },
            });

            return user;
          }

          // Verify password
          if (!verifyPassword(user.hashedPassword!, password)) {
            return null;
          }

          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }

          // TODO: Consider further error handling
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
