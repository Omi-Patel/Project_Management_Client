"use client";

import type React from "react";
import { Link } from "@tanstack/react-router";
import {
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Check,
  GanttChart,
} from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
    }, 1000);
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  const quickLinks = [
    { label: "Features", href: "/" },
    { label: "Pricing", href: "/" },
    { label: "Documentation", href: "/" },
    { label: "About", href: "/" },
    { label: "Contact", href: "/" },
  ];

  const legalLinks = [
    { label: "Privacy", href: "/" },
    { label: "Terms", href: "/" },
    { label: "Cookies", href: "/" },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand & Description */}
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="p-1.5 rounded-lg shadow-md shadow-blue-500/20 ">
                <GanttChart className="h-5 w-5 " />
              </div>
              <span
                style={{ fontFamily: "Edu VIC WA NT Hand" }}
                className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Veltrix
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Building the future of project management with intuitive tools
              that help teams collaborate and succeed.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-6">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-foreground mb-6">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Get the latest updates and features delivered to your inbox.
            </p>

            {isSubscribed ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
                <Check className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Thanks for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {year} Veltrix. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
