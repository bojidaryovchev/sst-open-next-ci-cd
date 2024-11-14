"use client";

import { verifyActionToken } from "@/actions/2fa.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

type WrappableComponent<P = object> = React.ComponentType<P & { onAction: (...args: never[]) => void }>;

interface WithVerificationProps {
  onVerifiedAction: (...args: never[]) => void;
}

export function withVerification<P extends WithVerificationProps>(
  WrappedComponent: WrappableComponent<P>,
  actionName: string,
): React.FC<Omit<P, "onAction">> {
  return function WithVerification(props: Omit<P, "onAction">) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [actionArgs, setActionArgs] = useState<never[]>([]);

    const handleAction = (...args: never[]) => {
      setActionArgs(args);
      setIsVerifying(true);
    };

    const handleVerify = async () => {
      try {
        const result = await verifyActionToken(verificationCode);
        if ("success" in result) {
          setIsVerifying(false);
          props.onVerifiedAction(...actionArgs);
        } else {
          setError(result.error || "Verification failed");
        }
      } catch {
        setError("An error occurred during verification");
      }
    };

    return (
      <>
        <WrappedComponent {...(props as P)} onAction={handleAction} />
        <Dialog open={isVerifying} onOpenChange={setIsVerifying}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Action</DialogTitle>
              <DialogDescription>Please enter your 2FA code to {actionName}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                type="text"
                placeholder="Enter 2FA code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              {error && <p className="text-red-500">{error}</p>}
              <Button onClick={handleVerify}>Verify</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };
}
