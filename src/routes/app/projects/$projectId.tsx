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
  useRouter,
} from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { getAllTasksByProjectId, getProjectById } from "@/lib/actions";
import type { ProjectSchema } from "@/schemas/project-schema";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import TaskList from "@/components/Project_Task/task-list";
import { TaskFormDialog } from "@/components/Project_Task/task-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Table } from "lucide-react";
import TaskBoard from "@/components/TaskBoard";

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

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

function RouteComponent() {
  const project = Route.useLoaderData();
  const router = useRouter();

  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  const navigate = useNavigate();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [page, setPage] = useState(1); // Current page
  const [size] = useState(10); // Number of tasks per page
  const [search, setSearch] = useState<string | null>(null); // Search query

  // Fetch tasks using getAllTasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", projectId, page, size, search], // Query key includes pagination and search
    queryFn: async () => {
      return await getAllTasksByProjectId({ projectId, search, page, size });
    },
    placeholderData: keepPreviousData, // Keep previous data while fetching new data
  });

  const handleTaskAdded = async () => {
    setIsAddDialogOpen(false);
    router.invalidate();
  };

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to the first page when a new search is performed
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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

        <div className="flex items-center gap-4 mb-4">
          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search tasks..."
            value={search || ""}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>

        {isLoading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load tasks.</p>
        ) : (
          <Tabs defaultValue="taskList">
            <TabsList className="mb-4 ml-auto flex justify-end w-auto">
              <TabsTrigger value="taskList">
                <Table />
              </TabsTrigger>
              <TabsTrigger value="taskBoard">
                <BarChart2 />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="taskList">
              <TaskList tasks={data ?? []} projectId={projectId} />
            </TabsContent>
            <TabsContent value="taskBoard">
              <TaskBoard taskIds={data?.map((task) => task.id) ?? []} />
            </TabsContent>
          </Tabs>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-end items-center mt-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              variant="outline"
            >
              Previous
            </Button>

            <Button
              onClick={() => handlePageChange(page + 1)}
              disabled={page > Math.ceil((data?.length ?? 0) / size)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <TaskFormDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        task={null}
        projectId={projectId}
        mode="add"
        onSuccess={handleTaskAdded}
      />
    </SidebarInset>
  );
}
