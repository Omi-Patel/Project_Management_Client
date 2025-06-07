"use client";

import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/auth";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem(STORAGE_KEYS.USER_ID);
  };

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="relative hover:text-primary transition-colors duration-300 group"
      >
        Features
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
      </Link>
      <Link
        to="/"
        className="relative hover:text-primary transition-colors duration-300 group"
      >
        Pricing
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
      </Link>
      <Link
        to="/"
        className="relative hover:text-primary transition-colors duration-300 group"
      >
        Resources
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
      </Link>
    </>
  );

  const AuthButtons = () => (
    <>
      {isLoggedIn() ? (
        <Button
          asChild
          variant="default"
          className="transition-all duration-300 hover:scale-105"
        >
          <Link to="/app/dashboard">Go to Dashboard</Link>
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="transition-all duration-300 hover:scale-105"
          >
            <Link to="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="transition-all duration-300 hover:scale-105"
          >
            <Link to="/auth/register">Sign Up</Link>
          </Button>
        </div>
      )}
    </>
  );

  return (
    <nav
      className={`w-full py-4 px-6 md:px-12 flex justify-between items-center border-b fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 `}
    >
      <Link
        to="/"
        className="font-bold text-4xl tracking-tight transition-transform duration-300 hover:scale-105"
      >
        <span style={{ fontFamily: "Edu VIC WA NT Hand" }}>Veltrix</span>
      </Link>

      {isMobile ? (
        <div className="flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-300 hover:bg-gray-100"
              >
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-[300px] sm:w-[400px]"
              onInteractOutside={() => setIsSheetOpen(false)}
              onEscapeKeyDown={() => setIsSheetOpen(false)}
            >
              <div className="flex flex-col mt-10 mx-4 space-y-8 text-lg">
                {/* Navigation Links */}
                <nav className="flex flex-col space-y-6">
                  <NavLinks />
                </nav>

                {/* Authentication Buttons */}
                <div className="pt-6 border-t border-gray-200">
                  <AuthButtons />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div className="flex items-center space-x-10">
          <div className="flex space-x-8">
            <NavLinks />
          </div>
          <AuthButtons />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
