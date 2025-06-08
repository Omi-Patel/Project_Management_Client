"use client";

import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/auth";
import {
  Moon,
  Sun,
  GanttChart,
  PanelLeftClose,
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTheme } from "../theme-provider";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { setTheme, theme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem(STORAGE_KEYS.USER_ID);
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isSheetOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "var(--removed-scroll-width, 0px)";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isSheetOpen]);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-1" : "flex space-x-8"}>
      <Link
        to="/"
        className={`relative font-medium transition-all duration-300 group ${
          mobile
            ? "text-lg py-2 hover:text-primary"
            : "text-sm hover:text-primary"
        }`}
        onClick={mobile ? () => setIsSheetOpen(false) : undefined}
      >
        Features
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
      </Link>
      <Link
        to="/"
        className={`relative font-medium transition-all duration-300 group ${
          mobile
            ? "text-lg py-2 hover:text-primary"
            : "text-sm hover:text-primary"
        }`}
        onClick={mobile ? () => setIsSheetOpen(false) : undefined}
      >
        Pricing
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
      </Link>
      <Link
        to="/"
        className={`relative font-medium transition-all duration-300 group ${
          mobile
            ? "text-lg py-2 hover:text-primary"
            : "text-sm hover:text-primary"
        }`}
        onClick={mobile ? () => setIsSheetOpen(false) : undefined}
      >
        Resources
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
      </Link>
    </div>
  );

  const ThemeToggle = ({ mobile = false }: { mobile?: boolean }) => (
    <Button
      variant="ghost"
      size={mobile ? "default" : "icon"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={`transition-all duration-300 hover:scale-105 ${
        mobile
          ? "w-full justify-start gap-3 text-lg py-3 h-auto"
          : "h-9 w-9 hover:bg-muted"
      }`}
    >
      {theme === "light" ? (
        <>
          <Moon className={mobile ? "h-5 w-5" : "h-4 w-4"} />
          {mobile && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className={mobile ? "h-5 w-5" : "h-4 w-4"} />
          {mobile && <span>Light Mode</span>}
        </>
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col space-y-3" : "flex gap-3"}>
      {isLoggedIn() ? (
        <Button
          asChild
          variant="default"
          className={`transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl ${
            mobile ? "w-full py-3 text-lg" : ""
          }`}
          onClick={mobile ? () => setIsSheetOpen(false) : undefined}
        >
          <Link to="/app/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      ) : (
        <>
          <Button
            asChild
            variant="outline"
            className={`transition-all duration-300 hover:scale-105 border-2 hover:border-primary hover:bg-primary/5 ${
              mobile ? "w-full py-3 text-lg" : ""
            }`}
            onClick={mobile ? () => setIsSheetOpen(false) : undefined}
          >
            <Link to="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            variant="default"
            className={`transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl ${
              mobile ? "w-full py-3 text-lg" : ""
            }`}
            onClick={mobile ? () => setIsSheetOpen(false) : undefined}
          >
            <Link to="/auth/register">Sign Up</Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <nav className="w-full py-4 px-6 mx-auto flex justify-between items-center border-b bg-background/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-sm">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-2xl md:text-3xl tracking-tight "
      >
        <div className="p-1.5  rounded-lg shadow-md shadow-blue-500/20">
          <GanttChart className="h-5 w-5 md:h-6 md:w-6 " />
        </div>
        <span
          style={{ fontFamily: "Edu VIC WA NT Hand" }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Veltrix
        </span>
      </Link>

      {isMobile ? (
        <div className="flex items-center gap-2">
          {/* Theme toggle for mobile header */}
          <ThemeToggle />

          {/* Mobile menu trigger */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-300 hover:bg-muted hover:scale-105"
              >
                <PanelLeftClose className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-[320px] sm:w-[400px] p-0"
              onInteractOutside={() => setIsSheetOpen(false)}
              onEscapeKeyDown={() => setIsSheetOpen(false)}
            >
              {/* Mobile menu header */}
              <div className="flex items-center justify-between p-5 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5  rounded-lg shadow-md  shadow-blue-500/20">
                    <GanttChart className="h-4 w-4 " />
                  </div>
                  <span
                    style={{ fontFamily: "Edu VIC WA NT Hand" }}
                    className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    Veltrix
                  </span>
                </div>
              </div>

              {/* Mobile menu content */}
              <div className="flex flex-col p-6 space-y-8">
                {/* Navigation Links */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Navigation
                  </h3>
                  <NavLinks mobile />
                </div>

                {/* Authentication Buttons */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Account
                  </h3>
                  <AuthButtons mobile />
                </div>
              </div>
            </SheetContent>
            <SheetDescription></SheetDescription>
          </Sheet>
        </div>
      ) : (
        <div className="flex items-center space-x-8">
          {/* Desktop Navigation */}
          <NavLinks />

          <div className="flex items-center gap-4">
            {/* Desktop Theme Toggle */}
            <ThemeToggle />

            {/* Desktop Auth Buttons */}
            <AuthButtons />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
