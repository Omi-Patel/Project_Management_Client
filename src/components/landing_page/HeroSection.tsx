import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  const isLoggedIn = () => {
    if (localStorage.getItem(STORAGE_KEYS.USER_ID)) {
      return true;
    }
    return false;
  };

  return (
    <div className="container mx-auto px-6 pt-20 pb-24 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Manage Your Projects <br />
        <span className="text-primary">
          with Confidence
        </span>
      </h1>
      <p className="text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground mb-10">
        Streamline your workflow, collaborate seamlessly, and deliver projects on time with our all-in-one project management solution.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {isLoggedIn() ? (
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/app/dashboard">
              Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/auth/register">
                Start for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/" className="flex items-center">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Link>
            </Button>
          </>
        )}
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-4 inline-block">
        <p className="text-sm text-muted-foreground">
          Trusted by 2,000+ teams worldwide
        </p>
      </div>
    </div>
  );
};

export default HeroSection;