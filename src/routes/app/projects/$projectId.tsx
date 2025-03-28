"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { getProjectById } from "@/lib/actions";
import type { ProjectSchema } from "@/schemas/project-schema";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import TaskList from "@/components/Project_Task/task-list";
import { TaskFormDialog } from "@/components/Project_Task/task-form-dialog";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const projectId = params.projectId;
    const project = await getProjectById(projectId);
    return project as ProjectSchema;
  },
  pendingComponent: () => {
    return <LoadingScreen />;
  },
});

function RouteComponent() {
  const project = Route.useLoaderData();
  const queryClient = useQueryClient();

  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  const navigate = useNavigate();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [tasks, setTasks] = useState(project.taskIds || []);

  // Re-fetch project data when tasks change
  useEffect(() => {
    const fetchProject = async () => {
      const updatedProject = await getProjectById(projectId);
      if (updatedProject && updatedProject.taskIds) {
        setTasks(updatedProject.taskIds);
      }
    };

    // Listen for task-related query invalidations
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      fetchProject();
    });

    return () => {
      unsubscribe();
    };
  }, [projectId, queryClient]);

  const handleTaskAdded = async () => {
    setIsAddDialogOpen(false);
    // Manually refresh the project data to get updated taskIds
    const updatedProject = await getProjectById(projectId);
    if (updatedProject && updatedProject.taskIds) {
      setTasks(updatedProject.taskIds);
    }
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block cursor-pointer">
                  <BreadcrumbLink
                    onClick={() => navigate({ to: "/app/projects" })}
                  >
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{project.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      <Separator className="mb-4" />

      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary">{project.name}</h1>
        <p className="text-primary mt-2 border p-4 rounded-lg">
          {project.description || "No description available"}
        </p>
        <div className="mt-4 text-sm text-primary">
          <p>
            <strong>Start Date:</strong>{" "}
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>End Date:</strong>{" "}
            {project.endDate
              ? new Date(project.endDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Task List Section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Tasks</h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>+ Add Task</Button>
        </div>

        <TaskList taskIds={tasks} projectId={projectId} />

        {/* Add Task Dialog */}
        <TaskFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          task={null}
          projectId={projectId}
          mode="add"
          onSuccess={handleTaskAdded}
        />
      </div>
    </SidebarInset>
  );
}
