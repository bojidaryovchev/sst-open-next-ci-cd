"use client";

import { registerUser } from "@/actions/auth.actions";
import { RegisterFormInput, registerSchema } from "@/schemas/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

const CredentialsRegister: React.FC = () => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (formValues: RegisterFormInput) => {
    setServerError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append("email", formValues.email);
    formData.append("password", formValues.password);
    formData.append("confirmPassword", formValues.confirmPassword);

    const result = await registerUser(formData);

    if ("error" in result) {
      setServerError(result.error ?? "");
    } else if ("success" in result) {
      setSuccessMessage(result.success);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && <p className="text-red-500">{serverError}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          {...register("email")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Password
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          {...register("password")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Confirm Password
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? "Registering..." : "Register"}
      </button>

      <p className="text-sm text-gray-600">
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        Didn't receive a verification email?{" "}
        <Link href="/resend-verification" className="text-blue-500 hover:underline">
          Click here to get a new one
        </Link>
      </p>
    </form>
  );
};

export default CredentialsRegister;
