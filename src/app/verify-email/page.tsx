"use client";

import { verifyEmail } from "@/actions/auth.actions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const VerifyEmail: React.FC = () => {
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
        } else {
          setStatus("error");
          setMessage(result.error);
        }
      });
    } else {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Email Verification</h1>
      {status === "loading" && <p>Verifying your email...</p>}
      {status === "success" && <p className="text-green-500">{message}</p>}
      {status === "error" && <p className="text-red-500">{message}</p>}
    </div>
  );
};

export default VerifyEmail;
