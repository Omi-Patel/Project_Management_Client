import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"; // Assuming you have a ShadCN Sidebar component
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const Route = createFileRoute("/app/dashboard")({
  component: RouteComponent,

  loader: async () => {
      const userId = localStorage.getItem("userId");
  
      if (!userId) {
        // If email exists in localStorage, redirect to dashboard
        return redirect({ to: "/auth/login" });
      }
    },
});

function RouteComponent() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <Separator className="mb-4" />
    </SidebarInset>
  );
}
