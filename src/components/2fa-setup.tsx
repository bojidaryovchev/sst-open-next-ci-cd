"use client";

import { setup2FA, verify2FA } from "@/actions/2fa.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

export function TwoFactorSetup() {
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSetup = async () => {
    try {
      const result = await setup2FA();
      if ("otpauthUrl" in result) {
        setOtpauthUrl(result.otpauthUrl);
        setBackupCodes(result.backupCodes);
      } else {
        setError("Failed to set up 2FA");
      }
    } catch {
      setError("An error occurred while setting up 2FA");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.append("token", verificationToken);
    try {
      const result = await verify2FA(formData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Verification failed");
      }
    } catch {
      setError("An error occurred during verification");
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>2FA Setup Complete</CardTitle>
          <CardDescription>2FA has been successfully set up!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Please save these backup codes in a secure location:</p>
          <ul className="list-disc pl-5">{backupCodes?.map((code, index) => <li key={index}>{code}</li>)}</ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>Enhance your account security with 2FA</CardDescription>
      </CardHeader>
      <CardContent>
        {!otpauthUrl ? (
          <Button onClick={handleSetup}>Set up 2FA</Button>
        ) : (
          <>
            <p className="mb-2">Scan this QR code with your authenticator app:</p>
            <QRCodeSVG value={otpauthUrl} className="mb-4" />
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Enter verification code"
              />
              <Button type="submit">Verify</Button>
            </form>
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
