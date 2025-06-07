"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Users, BarChart4, Tablet, Zap, Shield } from "lucide-react";

const features = [
  {
    title: "Real-time Collaboration",
    description:
      "Work together with your team in real-time, no matter where they are located.",
    icon: Users,
  },
  {
    title: "Time Tracking",
    description:
      "Track hours spent on tasks and projects to improve productivity and billing.",
    icon: Clock,
  },
  {
    title: "Advanced Analytics",
    description:
      "Get insights into project performance with customizable dashboards and reports.",
    icon: BarChart4,
  },
  {
    title: "Mobile Friendly",
    description:
      "Access your projects on the go with our responsive mobile application.",
    icon: Tablet,
  },
  {
    title: "Fast Performance",
    description:
      "Lightning-fast experience with optimized loading times and responsive UI.",
    icon: Zap,
  },
  {
    title: "Secure & Reliable",
    description:
      "Your data is encrypted and backed up regularly for maximum security.",
    icon: Shield,
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="py-20" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold mb-6">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage projects efficiently in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`border shadow-sm hover:shadow-lg transition-all duration-500 p-6 rounded-lg  transform hover:-translate-y-1 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              }`}
              style={{
                transitionDelay: `${150 * index}ms`,
                transitionProperty: "all",
              }}
            >
              <div className="mb-4">
                <div className="p-3 rounded-full bg-primary/10 inline-block mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
