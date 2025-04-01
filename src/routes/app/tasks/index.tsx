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
import { getTasksByUserId } from "@/lib/actions";

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
            <TaskList taskIds={taskIds} projectId={""} />
          </TabsContent>
          <TabsContent value="taskBoard">
            <TaskBoard taskIds={taskIds} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  );
}
