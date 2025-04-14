import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/auth";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "@tanstack/react-router";

const Navbar = () => {
  const isMobile = useIsMobile();

  const isLoggedIn = () => {
    if (localStorage.getItem(STORAGE_KEYS.USER_ID)) {
      return true;
    }
    return false;
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-primary transition-colors">
        Features
      </Link>
      <Link to="/" className="hover:text-primary transition-colors">
        Pricing
      </Link>
      <Link to="/" className="hover:text-primary transition-colors">
        Resources
      </Link>
    </>
  );

  const AuthButtons = () => (
    <>
      {isLoggedIn() ? (
        <Button asChild variant="default">
          <Link to="/app/dashboard">Go to Dashboard</Link>
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link to="/auth/login">Sign In</Link>
          </Button>
          <Button asChild variant="default">
            <Link to="/auth/register">Sign Up</Link>
          </Button>
        </div>
      )}
    </>
  );

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center border-b">
      <Link to="/" className="font-bold text-2xl tracking-tight">
        PMS
      </Link>

      {isMobile ? (
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-6 mt-10 text-lg">
                <NavLinks />
                <div className="pt-4">
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
