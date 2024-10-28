import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .optional(),
  callbackUrl: z.string().optional(),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
