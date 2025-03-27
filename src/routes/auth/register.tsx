import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { UserInputSchema, type UserInput } from "@/schemas/user-schema";
import { createUser } from "@/lib/actions";
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

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
  loader: async () => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      // If email exists in localStorage, redirect to dashboard
      return redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<UserInput>({
    resolver: zodResolver(UserInputSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      status: "ACTIVE",
    },
  });

  // Create a mutation for user registration
  const registerMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Registration Successful", {
        description: "You can now log in with your credentials.",
      });
      navigate({ to: "/auth/login" });
    },
    onError: (error) => {
      console.error("Registration error:", error);
      toast.error("Registration Failed", {
        description: "Please check your input and try again.",
      });
    },
  });

  const onSubmit = (data: UserInput) => {
    registerMutation.mutate(data);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border border-border">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-card-foreground">
            Create an Account
          </h1>
          <p className="text-muted-foreground">Sign up to get started</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-card-foreground">Name</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        {...field}
                        disabled={registerMutation.isPending}
                        className="bg-input pl-10"
                      />
                    </FormControl>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-card-foreground">Email</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        {...field}
                        disabled={registerMutation.isPending}
                        className="bg-input pl-10"
                      />
                    </FormControl>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <FormLabel className="text-card-foreground">
                    Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...field}
                        disabled={registerMutation.isPending}
                        className="bg-input pl-10 pr-10"
                      />
                    </FormControl>
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
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

            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-card-foreground">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your phone number (optional)"
                      {...field}
                      disabled={registerMutation.isPending}
                      className="bg-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>

        {/* Already have an account */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-primary hover:underline font-semibold"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
