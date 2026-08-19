import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthShell } from "../auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Card className="relative w-full max-w-sm border-white/10 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-center text-primary">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </AuthShell>
  );
}
