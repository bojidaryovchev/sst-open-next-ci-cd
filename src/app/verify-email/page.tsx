"use client";

import { verifyEmail } from "@/actions/auth.actions";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmail(token).then((result) => {
        if ("success" in result) {
          setStatus("success");
          setMessage(result.success ?? "");
          router.push("/");
        } else {
          setStatus("error");
          setMessage(result.error);
        }
      });
    } else {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Email Verification</h1>
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && <p className="text-green-500">{message}</p>}
      {status === "error" && <p className="text-red-500">{message}</p>}
    </div>
  );
};

export default VerifyEmailPage;
