import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--success-bg": "#22c55e", // Green background for success
          "--success-text": "#ffffff", // White text for success
          "--success-border": "#16a34a",
          "--error-bg": "#ef4444", // Red background for error
          "--error-text": "#ffffff", // White text for error
          "--error-border": "#dc2626",
        } as React.CSSProperties
      }
      {...props}
      richColors
    />
  );
};

export { Toaster };
