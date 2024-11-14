"use client";

import { withVerification } from "@/components/HOC/with-verification";
import { SensitiveAction } from "@/components/sensitive-action";

const VerifiedSensitiveAction = withVerification(SensitiveAction, "perform this sensitive action");

export default function SensitiveActionsPage() {
  const handleSensitiveAction = () => {
    console.log("Sensitive action performed!");
    // Perform the actual sensitive action here
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sensitive Actions</h1>
      <VerifiedSensitiveAction onVerifiedAction={handleSensitiveAction} />
    </div>
  );
}
