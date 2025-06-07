import { AdminAppSidebar } from "@/components/Admin-portal-sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getUserById } from "@/lib/actions";
import { STORAGE_KEYS } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const userId = localStorage.getItem("pms-userId"); // Get userId from localStorage

  // Mutation to fetch user by ID
  const fetchUserMutation = useMutation({
    mutationFn: (id: string) => getUserById(id),

    onError: (error) => {
      console.error("Failed to fetch user:", error);
    },
  });

  useEffect(() => {
    if (userId) {
      fetchUserMutation.mutate(userId); // Trigger the mutation to fetch user
    }
  }, [userId]);

  return (
    <SidebarProvider>
      {fetchUserMutation.data &&
        (() => {
          const roles = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.ROLES) || "[]"
          );

          if (roles.includes("ADMIN")) {
            return <AdminAppSidebar user={fetchUserMutation.data} />;
          }

          // fallback
          return <AppSidebar user={fetchUserMutation.data} />;
        })()}
      <Outlet />
    </SidebarProvider>
  );
}
