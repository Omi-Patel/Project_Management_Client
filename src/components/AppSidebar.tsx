"use client";

import type * as React from "react";
import {
  Archive,
  Folder,
  GalleryVerticalEnd,
  Home,
  Layers,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import type { UserResponse } from "@/schemas/user-schema";
import { Badge } from "@/components/ui/badge";

// Navigation data
const data = {
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
      title: "My Tasks",
      url: "/app/tasks",
      icon: Archive,
      iconColor: "text-emerald-500",
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: UserResponse }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <SidebarHeader className=" border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className=" hover:bg-sidebar-accent/50"
            >
              <a href="#">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-5" />
                </div>
                <div className="flex flex-col gap-1 leading-none">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-lg"
                      style={{ fontFamily: "Edu VIC WA NT Hand" }}
                    >
                      Veltrix
                    </span>
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      <User className="size-3 mr-1" />
                      Employee
                    </Badge>
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="p-4">
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
