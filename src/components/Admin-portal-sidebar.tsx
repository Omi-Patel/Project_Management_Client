"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { UserResponse } from "@/schemas/user-schema";
import { Link } from "@tanstack/react-router";
import {
  Folders,
  GalleryVerticalEnd,
  HardDrive,
  Home,
  Users2,
} from "lucide-react";
import { NavUser } from "./NavUser";

// Admin Menu items.
export const adminItems = [
  {
    title: "Dashboard",
    url: "/app/admin-portal/dashboard",
    icon: Home,
  },
  {
    title: "All Projects",
    url: "/app/admin-portal/projects",
    icon: Folders,
  },
  {
    title: "All Tasks",
    url: "/app/admin-portal/tasks",
    icon: HardDrive,
  },
  {
    title: "Users",
    url: "/app/admin-portal/users",
    icon: Users2,
  },
];

interface AdminAppSidebarProps {
  user: UserResponse;
}

export function AdminAppSidebar({ user }: AdminAppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span
                    className="font-semibold text-lg"
                    style={{ fontFamily: "Edu VIC WA NT Hand" }}
                  >
                    Veltrix Employee
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
