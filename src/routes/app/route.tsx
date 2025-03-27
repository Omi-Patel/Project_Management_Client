import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getUserById } from "@/lib/actions";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const userId = localStorage.getItem("userId"); // Get userId from localStorage

  // Mutation to fetch user by ID
  const fetchUserMutation = useMutation({
    mutationFn: (id: string) => getUserById(id),
    onSuccess: (data) => {
      console.log("User data fetched successfully:", data);
    },
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
      {fetchUserMutation.data && <AppSidebar user={fetchUserMutation.data} />}
      <Outlet />
    </SidebarProvider>
  );
}
