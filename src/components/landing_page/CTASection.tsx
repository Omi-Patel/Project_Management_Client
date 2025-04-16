"use client"

import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const CTASection = () => {
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
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-20" ref={sectionRef}>
      <div
        className={`container mx-auto px-6 text-center transition-all duration-1000 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        }`}
      >
        <h2 className="text-3xl font-bold mb-6">Ready to transform your project management?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of teams already using PMS to deliver projects successfully
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Link to="/auth/register">
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5 animate-bounce-x" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
          >
            <Link to="/">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CTASection
