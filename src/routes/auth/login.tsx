import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { LoginInputSchema, type LoginInput } from "@/schemas/user-schema";
import { loginUser, resendOtp } from "@/lib/actions";
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
import { LoadingScreen } from "@/components/LoadingScreen";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
  loader: async () => {
    const isLoggedIn = await authService.isLoggedIn();
    if (isLoggedIn) {
      return redirect({ to: "/app/dashboard" });
    }
  },
  pendingComponent: () => {
    return <LoadingScreen />;
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginInputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Create a mutation for login
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      // Store tokens and user info in localStorage
      await authService.setTokens(data);

      // Show success toast
      toast.success("Login Successful", {
        description: "Welcome back! Redirecting to dashboard...",
      });

      navigate({ to: "/app/dashboard" });
    },
    onError: async (error: any) => {
      console.error("Login error:", error);

      // Check if the error is about email verification
      if (error?.response?.data?.message?.includes("verify your email")) {
        const userEmail = form.getValues("email");

        await resendOtp(userEmail);
        // Automatically redirect to verify-otp screen with email
        navigate({
          to: "/auth/verify-otp",
          search: { email: userEmail },
        });
      }
      // Other error handling is done centrally in the actions file
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  // Error handling is now done centrally in the actions file

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.1),transparent_50%)]" />

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-primary/10 rounded-full blur-lg" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-primary/5 rounded-full blur-md" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-16 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                Sign in to access your project management dashboard and continue
                where you left off.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure authentication</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <Zap className="w-4 h-4" />
                <span>Lightning fast performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          <div className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Email Address
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            {...field}
                            disabled={loginMutation.isPending}
                            className="h-12 bg-background border-2 border-border pl-12 pr-4 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          />
                        </FormControl>
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Password
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
                            disabled={loginMutation.isPending}
                            className="h-12 bg-background border-2 border-border pl-12 pr-12 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          />
                        </FormControl>
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

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

            {/* Don't have an account */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/auth/register"
                  className="text-primary hover:text-primary/80 font-semibold transition-colors duration-200"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
