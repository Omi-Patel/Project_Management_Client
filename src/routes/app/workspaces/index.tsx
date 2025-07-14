import { createFileRoute } from "@tanstack/react-router";
import { SidebarInset } from "@/components/ui/sidebar";
import { WorkspaceList } from "@/components/workspace/workspace-list";

export const Route = createFileRoute("/app/workspaces/")({
  component: RouteComponent,
});

function RouteComponent() {
  const userId = localStorage.getItem("pms-userId") || "";

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Please log in to view workspaces</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarInset>
      <WorkspaceList userId={userId} />
    </SidebarInset>
  );
}

export default RouteComponent; 