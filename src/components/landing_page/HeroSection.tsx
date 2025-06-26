"use client";

import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Play } from "lucide-react";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const isLoggedIn = () => {
    return !!localStorage.getItem(STORAGE_KEYS.USER_ID);
  };

  return (
    <div className="container mx-auto px-6 pt-32  text-center min-h-[90vh] flex flex-col justify-center items-center">
      {/* Give us a star badge */}
      <a
        href="https://github.com/Omi-Patel/Project_Management_Client"
        target="_blank"
      >
        <div
          className={`inline-flex items-center justify-center gap-2 mb-6 px-5 py-2 rounded-full border border-emerald-400 bg-emerald-100 text-emerald-800 font-semibold shadow-md transition-all duration-700 transform ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          } hover:shadow-lg hover:scale-105`}
        >
          ⭐ Give us a star on GitHub!
          <ExternalLink className=" h-4 w-4" />
        </div>
      </a>
      {/* Heading with animation */}
      <div
        className={`transition-all duration-1000 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight tracking-tight">
          <span style={{ fontFamily: "Edu VIC WA NT Hand" }}>
            Build. Track. Deliver.
          </span>{" "}
          <br />
          <span className="bg-gradient-to-r from-slate-600 via-gray-700 to-gray-500 bg-clip-text text-transparent animate-gradient-x">
            Projects Made Simple
          </span>
        </h1>
      </div>

      {/* Subheading with animation */}
      <div
        className={`transition-all duration-1000 delay-300 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <p className="text-lg md:text-2xl max-w-2xl mx-auto text-muted-foreground mb-12">
          Simplify your team's workflow, collaborate in real-time, and meet
          every deadline — all in one platform.
        </p>
      </div>

      {/* CTA Buttons with animation */}
      <div
        className={`flex flex-wrap justify-center gap-4 mb-14 transition-all duration-1000 delay-500 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {isLoggedIn() ? (
          <Button
            asChild
            size="lg"
            className="px-6 bg-black text-white hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Link to="/app/dashboard">
              Go to Dashboard{" "}
              <ArrowRight className="ml-2 h-5 w-5 animate-bounce-x" />
            </Link>
          </Button>
        ) : (
          <>
            <Button
              asChild
              size="lg"
              className="px-6 bg-black text-white hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Link to="/auth/register">
                Start for Free{" "}
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce-x" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className=" text-primary dark:bg-secondary transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
            >
              <Link to="/" className="flex items-center">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
