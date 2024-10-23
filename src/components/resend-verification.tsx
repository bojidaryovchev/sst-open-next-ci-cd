"use client";

import { resendVerificationEmail } from "@/actions/auth.actions";
import { useState } from "react";

const ResendVerification: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await resendVerificationEmail(email);

      if ("error" in result) {
        setMessage(result.error ?? "");
      } else {
        setMessage(result.success);
        setEmail("");
      }
    } catch {
      setMessage("An unexpected error occurred");
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isSubmitting ? "Sending..." : "Resend Verification Email"}
      </button>
      {message && <p className={message.includes("error") ? "text-red-500" : "text-green-500"}>{message}</p>}
    </form>
  );
};

export default ResendVerification;
