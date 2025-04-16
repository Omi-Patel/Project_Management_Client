"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager at TechCorp",
    image: "/placeholder.svg",
    testimonial:
      "PMS has completely transformed how our team manages projects. The interface is intuitive and the features are exactly what we needed.",
  },
  {
    name: "Michael Chen",
    role: "CTO at StartupX",
    image: "/placeholder.svg",
    testimonial:
      "We've tried many project management tools, but PMS stands out with its powerful analytics and real-time collaboration features.",
  },
  {
    name: "Emma Rodriguez",
    role: "Team Lead at DesignHub",
    image: "/placeholder.svg",
    testimonial:
      "The time tracking feature has been a game-changer for our team's productivity. I can't imagine managing our projects without PMS now.",
  },
  {
    name: "David Kim",
    role: "Engineering Manager at DevCo",
    image: "/placeholder.svg",
    testimonial:
      "PMS has the perfect balance of simplicity and powerful features. It's helped us deliver projects on time with much less stress.",
  },
];

const TestimonialsSection = () => {
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
    <div className="bg-primary/5 py-20" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted by thousands of teams around the world
          </p>
        </div>

        <div
          className={`transition-all duration-1000 delay-300 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <Carousel className="w-full max-w-5xl mx-auto">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={index}
                  className="md:basis-1/2 lg:basis-1/2 p-2"
                >
                  <Card className="border shadow-sm h-full hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col h-full">
                      <blockquote className="text-lg mb-6 flex-grow">
                        "{testimonial.testimonial}"
                      </blockquote>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4 ring-2 ring-primary/20">
                          <AvatarImage
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="left-0 -translate-x-1/2" />
              <CarouselNext className="right-0 translate-x-1/2" />
            </div>
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
