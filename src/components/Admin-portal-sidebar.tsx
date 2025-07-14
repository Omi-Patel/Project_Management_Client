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
  useSidebar,
} from "@/components/ui/sidebar";
import type { UserResponse } from "@/schemas/user-schema";
import { Link } from "@tanstack/react-router";
import {
  Folders,
  GalleryVerticalEnd,
  HardDrive,
  Home,
  LayoutDashboard,
  LucideLayoutDashboard,
  Users2,
  Shield,
} from "lucide-react";
import { NavUser } from "./NavUser";
import { Badge } from "@/components/ui/badge";

// General navigation items
const generalItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    iconColor: "text-blue-500",
  },
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LucideLayoutDashboard,
    iconColor: "text-primary",
  },
];

// Admin-specific items
const adminItems = [
  {
    title: "Admin Dashboard",
    url: "/app/admin-portal/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-teal-500",
  },
  {
    title: "All Workspaces",
    url: "/app/admin-portal/workspaces",
    icon: Folders,
    iconColor: "text-blue-500",
  },
  {
    title: "All Projects",
    url: "/app/admin-portal/projects",
    icon: Folders,
    iconColor: "text-green-500",
  },
  {
    title: "All Tasks",
    url: "/app/admin-portal/tasks",
    icon: HardDrive,
    iconColor: "text-purple-500",
  },
  {
    title: "Users",
    url: "/app/admin-portal/users",
    icon: Users2,
    iconColor: "text-yellow-500",
  },
];

interface AdminAppSidebarProps {
  user: UserResponse;
}

export function AdminAppSidebar({ user }: AdminAppSidebarProps) {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className=" border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className=" hover:bg-sidebar-accent/50"
            >
              <Link to="/">
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
                    <Badge
                      variant="destructive"
                      className="text-xs px-2 py-0.5"
                    >
                      <Shield className="size-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="p-4 space-y-6">
        {/* General Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-3">
            General
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {generalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 px-3">
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon className={`size-4 ${item.iconColor}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Portal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground mb-3">
            Admin Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 px-3">
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon className={`size-4 ${item.iconColor}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
