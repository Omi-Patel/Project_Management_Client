import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
import { STORAGE_KEYS } from "@/lib/auth";
import { LoadingScreen } from "@/components/LoadingScreen";

export const Route = createFileRoute("/app/dashboard/")({
  component: RouteComponent,

  loader: async () => {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  
      if (!userId) {
        // If id not exists in localStorage, redirect to dashboard
        return redirect({ to: "/auth/login" });
      }
    },
});


function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

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

      <main>
        <div className="px-4 pb-6 space-y-6">
          <h1>Welcom 👋, Dashboard of PMS.</h1>
        </div>
      </main>
    </SidebarInset>
  );
}
