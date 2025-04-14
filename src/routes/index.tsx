import CTASection from "@/components/landing_page/CTASection";
import FeaturesSection from "@/components/landing_page/FeaturesSection";
import Footer from "@/components/landing_page/Footer";
import HeroSection from "@/components/landing_page/HeroSection";
import Navbar from "@/components/landing_page/Navbar";
import PricingSection from "@/components/landing_page/PricingSection";
import TestimonialsSection from "@/components/landing_page/TestimonialsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}
