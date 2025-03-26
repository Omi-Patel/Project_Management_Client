"use client";

import * as React from "react";
import {
  Archive,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Folder,
  Frame,
  GalleryVerticalEnd,
  Home,
  Layers,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./TeamSwitcher";
import { NavMain } from "./NavMain";
import { NavProjects } from "./NavProjects";
import { NavUser } from "./NavUser";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      iconColor: "text-cyan-500",
    },
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: Layers,
      iconColor: "text-indigo-500",
    },
    {
      title: "Projects",
      url: "/app/projects",
      icon: Folder,
      iconColor: "text-amber-500",
    },
    {
      title: "Tasks",
      url: "/app/tasks",
      icon: Archive,
      iconColor: "text-emerald-500",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
