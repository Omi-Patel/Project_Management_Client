import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Shield,
  CheckCircle,
  Clock,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { verifyOtp, resendOtp } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/auth";

const OtpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

type OtpInput = z.infer<typeof OtpSchema>;

export const Route = createFileRoute("/auth/verify-otp")({
  component: RouteComponent,
  loader: async () => {
    const isLoggedIn = await authService.isLoggedIn();
    if (isLoggedIn) {
      return redirect({ to: "/app/dashboard" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/verify-otp" });
  const email = (search as { email?: string }).email;
  const [countdown, setCountdown] = useState(0);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<OtpInput>({
    resolver: zodResolver(OtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);

    // Update form value
    const otpString = newOtpDigits.join("");
    form.setValue("otp", otpString);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (otpString.length === 6) {
      form.handleSubmit(onSubmit)();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtpDigits(digits);
      form.setValue("otp", pastedData);
      // Focus last input
      inputRefs.current[5]?.focus();
    }
  };

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyOtp(email, otp),
    onSuccess: () => {
      toast.success("Email verified successfully!", {
        description: "You can now log in with your credentials.",
      });
      navigate({ to: "/auth/login" });
    },
    onError: (error) => {
      console.error("OTP verification error:", error);
      // Error handling is now done centrally in the actions file
      // Clear OTP on error
      setOtpDigits(["", "", "", "", "", ""]);
      form.setValue("otp", "");
      inputRefs.current[0]?.focus();
    },
  });

  // Resend OTP mutation
  const resendOtpMutation = useMutation({
    mutationFn: (email: string) => resendOtp(email),
    onSuccess: () => {
      toast.success("OTP resent successfully!", {
        description: "Please check your email for the new verification code.",
      });
      setCountdown(60); // Start 60 second countdown
    },
    onError: (error) => {
      console.error("Resend OTP error:", error);
      // Error handling is now done centrally in the actions file
    },
  });

  const onSubmit = (data: OtpInput) => {
    if (!email) {
      toast.error("Email not found", {
        description: "Please register again.",
      });
      navigate({ to: "/auth/register" });
      return;
    }
    verifyOtpMutation.mutate({ email, otp: data.otp });
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email not found", {
        description: "Please register again.",
      });
      navigate({ to: "/auth/register" });
      return;
    }
    resendOtpMutation.mutate(email);
  };

  const handleBackToRegister = () => {
    navigate({ to: "/auth/register" });
  };

  // If no email is provided, redirect to register
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl">
              <Mail className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold">Email Required</h1>
            <p className="text-muted-foreground">
              Please register first to verify your email address.
            </p>
          </div>
          <Button
            onClick={handleBackToRegister}
            className="w-full h-12 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Register
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(120,119,198,0.1),transparent_50%)]" />

        {/* Floating Elements */}
        <div className="absolute top-24 left-24 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
        <div className="absolute bottom-24 right-24 w-28 h-28 bg-primary/10 rounded-full blur-lg" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-primary/5 rounded-full blur-md" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-16 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Verify Your Email
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                We've sent a secure verification code to your email address to
                ensure your account security.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure verification process</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Code expires in 10 minutes</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Key className="w-4 h-4 text-purple-500" />
                <span>6-digit verification code</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Verify Email</h1>
            <p className="text-muted-foreground">
              Enter the code sent to your email
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Display */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Verification code sent to:
              </p>
              <p className="text-sm font-medium text-foreground bg-muted/50 px-4 py-2 rounded-lg inline-block">
                {email}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* OTP Input Fields */}
                <FormField
                  control={form.control}
                  name="otp"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Verification Code
                      </FormLabel>
                      <FormControl>
                        <div
                          className="flex gap-3 justify-center"
                          onPaste={handlePaste}
                        >
                          {otpDigits.map((digit, index) => (
                            <Input
                              key={index}
                              ref={(el) => {
                                inputRefs.current[index] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleKeyDown(index, e)}
                              disabled={verifyOtpMutation.isPending}
                              className="w-14 h-14 text-center text-xl font-mono bg-background border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-200"
                              autoComplete="one-time-code"
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={
                    verifyOtpMutation.isPending ||
                    otpDigits.join("").length !== 6
                  }
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Verify Email
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Resend OTP Section */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                disabled={
                  countdown > 0 ||
                  resendOtpMutation.isPending ||
                  verifyOtpMutation.isPending
                }
                className="w-full h-12 rounded-xl border-2 hover:bg-muted/50"
              >
                {resendOtpMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* Back to Register */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToRegister}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft className=" h-4 w-4" />
                Back to Register
              </Button>

              {/* Already have an account */}
              <div className="text-center ">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/auth/login"
                    className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
