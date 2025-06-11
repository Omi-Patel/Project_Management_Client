"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Coffee,
  Rocket,
  Zap,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const loadingFacts = [
  "Did you know? The first computer bug was an actual bug found in 1947!",
  "Fun fact: JavaScript was created in just 10 days back in 1995.",
  "Coffee fact: Programmers consume 3x more coffee than average workers.",
  "Tech tip: The 'Hello, World!' tradition started in 1972.",
  "Did you know? The first website is still online at info.cern.ch",
  "Fun fact: There are over 700 programming languages in existence!",
  "Productivity tip: Taking breaks actually improves coding performance.",
  "History: The term 'debugging' comes from removing actual insects from computers.",
];

const loadingStages = [
  { icon: Coffee, text: "Brewing your request...", duration: 2000 },
  { icon: Zap, text: "Processing data...", duration: 3000 },
  { icon: Rocket, text: "Optimizing results...", duration: 4000 },
  { icon: CheckCircle, text: "Almost ready...", duration: 5000 },
];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          return 100;
        }
        // Slower progress at the end to make it more realistic
        const increment = prev > 80 ? 0.5 : prev > 60 ? 1 : 2;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Rotate facts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % loadingFacts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update loading stages based on progress
  useEffect(() => {
    if (progress < 25) setCurrentStage(0);
    else if (progress < 50) setCurrentStage(1);
    else if (progress < 80) setCurrentStage(2);
    else setCurrentStage(3);
  }, [progress]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = loadingStages[currentStage].icon;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex w-full max-w-md flex-col items-center space-y-8 p-8">
        {/* Main Loading Animation */}
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <div className="relative h-20 w-20 rounded-full border-4 border-muted">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-2 flex items-center justify-center">
              <CurrentIcon className="h-8 w-8 text-primary" />
            </div>
          </div>
        </motion.div>

        {/* Current Stage */}
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-lg font-medium text-foreground">
            {loadingStages[currentStage].text}
          </p>
        </motion.div>

        {/* Fun Facts Carousel */}
        <div className="relative h-16 w-full overflow-hidden rounded-lg bg-muted/50 p-4">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentFact}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {loadingFacts[currentFact]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Stats */}
        <div className="flex w-full justify-between text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{elapsedTime}s</span>
            </div>
            <p className="text-xs text-muted-foreground">Elapsed</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {Math.round(progress / (elapsedTime || 1))}%/s
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Speed</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Rocket className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {Math.max(
                  0,
                  Math.round((100 - progress) / (progress / (elapsedTime || 1)))
                )}
                s
              </span>
            </div>
            <p className="text-xs text-muted-foreground">ETA</p>
          </div>
        </div>

        {/* Encouraging Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            {elapsedTime < 5
              ? "Just getting started..."
              : elapsedTime < 10
                ? "Making good progress..."
                : elapsedTime < 20
                  ? "Almost there, hang tight!"
                  : "Thanks for your patience!"}
          </p>

          {elapsedTime > 10 && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-muted-foreground/80"
            >
              Good things take time. We're working hard behind the scenes! ✨
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
