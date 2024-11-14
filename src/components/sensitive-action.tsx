import React from "react";
import { Button } from "@/components/ui/button";

interface SensitiveActionProps {
  onAction: () => void;
}

export function SensitiveAction({ onAction }: SensitiveActionProps) {
  return <Button onClick={onAction}>Perform Sensitive Action</Button>;
}
