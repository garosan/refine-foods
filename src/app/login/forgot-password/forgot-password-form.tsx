"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// UI-only for v1 — no email provider configured. See PRD §6.1 / §11:
// "can be stubbed to a real email-reset flow if time allows, otherwise
// UI-only with a note in the PRD as a known gap."
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{email}</span>,
          a password reset link has been sent.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">
        Send reset link
      </Button>
      <Link
        href="/login"
        className="block text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}
