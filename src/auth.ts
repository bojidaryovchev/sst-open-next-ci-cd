import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import google from "next-auth/providers/google";
import prisma from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [google],
});
