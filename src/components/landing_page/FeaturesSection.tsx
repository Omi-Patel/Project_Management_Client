import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  return (
    <div className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage projects efficiently in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border shadow-sm hover:shadow-md transition-all p-6 rounded-lg"
            >
              <div className="mb-4">
                <feature.icon className="h-12 w-12 mb-4" />
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
