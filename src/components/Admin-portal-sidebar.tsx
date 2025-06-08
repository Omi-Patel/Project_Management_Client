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
} from "lucide-react";
import { NavUser } from "./NavUser";

// Admin Menu items.
const adminItems = [
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
  {
    title: "Admin Dashboard",
    url: "/app/admin-portal/dashboard",
    icon: LayoutDashboard,
    iconColor: "text-teal-500",
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
                    Veltrix | Admin
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
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
                      <item.icon className={item.iconColor} />
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
