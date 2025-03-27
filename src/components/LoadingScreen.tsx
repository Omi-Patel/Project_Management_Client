import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="flex w-full flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />

        <p className="text-lg font-medium text-muted-foreground">
          Loading&hellip;
        </p>
        <p className="text-sm text-muted-foreground/80">
          Please wait a moment.
        </p>
      </div>
    </div>
  );
}
