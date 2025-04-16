"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { Check } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals or small teams just getting started",
    features: ["Up to 5 team members", "3 active projects", "Basic reporting", "1GB storage", "Email support"],
    buttonText: "Get Started",
    buttonVariant: "outline",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per user / month",
    description: "For growing teams that need more power and flexibility",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced analytics",
      "10GB storage",
      "Priority support",
      "Custom fields",
      "Time tracking",
    ],
    buttonText: "Try Free for 14 Days",
    buttonVariant: "default",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific requirements",
    features: [
      "Unlimited everything",
      "Advanced security",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "On-premise deployment option",
      "SLA guarantees",
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    highlighted: false,
  },
]

const PricingSection = () => {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <div className="bg-background py-20" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your team's needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`transition-all duration-700 transform ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
              }`}
              style={{ transitionDelay: `${200 * index}ms` }}
            >
              <Card
                className={`h-full flex flex-col rounded-lg border shadow-sm transition-all duration-300 hover:-translate-y-2 ${
                  plan.highlighted
                    ? "border-primary shadow-lg relative z-10 scale-105 md:scale-110"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-sm font-medium py-1 px-4 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-semibold mb-4">{plan.name}</CardTitle>
                  <div className="mb-2 flex items-center">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-sm text-muted-foreground ml-2">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-sm text-muted-foreground">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-6">
                  <Button
                    asChild
                    variant={plan.buttonVariant as "default" | "outline"}
                    className={`w-full py-3 text-lg rounded-md transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Link to="/auth/register">{plan.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PricingSection
