import TaskList from "@/components/Project_Task/task-list";
import TaskBoard from "@/components/TaskBoard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTaskById, getTasksByUserId } from "@/lib/actions";
import type { TaskResponse } from "@/schemas/task_schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart2, Table } from "lucide-react";

export const Route = createFileRoute("/app/tasks/")({
  component: RouteComponent,
  loader: async () => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      throw new Error("User ID is not available in localStorage");
    }
    const taskIds = await getTasksByUserId(userId);
    return taskIds;
  },
});

function RouteComponent() {
  const taskIds = Route.useLoaderData();

  // Fetch tasks by task IDs
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", taskIds],
    queryFn: async () => {
      if (!taskIds || taskIds.length === 0) return [];
      const fetchedTasks = await Promise.all(
        taskIds.map((id: string) => getTaskById(id)) // Fetch each task by ID
      );
      return fetchedTasks;
    },
  });

  // Handle loading state
  if (isLoading) {
    return <p className="p-4">Loading tasks...</p>;
  }

  // Handle error state
  if (error) {
    return (
      <p className="p-4 text-red-500">
        Failed to load tasks. Please try again later.
      </p>
    );
  }

  // Handle empty state
  if (!tasks || tasks.length === 0) {
    return <p className="p-4">No tasks available.</p>;
  }

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
                  <BreadcrumbLink href="#">Tasks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Tasks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      <Separator className="mb-4" />

      {/* Tabs for TaskList and TaskBoard */}
      <div className="p-4">
        <h2 className="text-xl font-bold text-primary mb-4">My Tasks</h2>
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
            <TaskList
              taskIds={tasks
                .filter((task) => task !== null)
                .map((task) => task!.id)}
              projectId={""}
            />
          </TabsContent>
          <TabsContent value="taskBoard">
            <TaskBoard
              initialTasks={tasks.filter(
                (task): task is TaskResponse => task !== null
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}
