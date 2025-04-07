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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllTasks } from "@/lib/actions";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart2, Table } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/admin-portal/tasks/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(1); // Current page
  const [size] = useState(10); // Number of tasks per page
  const [search, setSearch] = useState<string | null>(null); // Search query

  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", page, size, search],
    queryFn: async () => {
      return await getAllTasks({ userId: "", search, page, size });
    },
    placeholderData: keepPreviousData,
  });

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to the first page when a new search is performed
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  console.log(data);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">All Tasks</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tasks List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      <Separator className="mb-4" />

      <div className="p-4">
        {/* Search and Pagination */}
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

        <h2 className="text-xl font-bold text-primary mb-4">My Tasks</h2>
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
              {/* <TabsTrigger value="taskBoard">
                <BarChart2 />
              </TabsTrigger> */}
            </TabsList>
            <TabsContent value="taskList">
              <TaskList tasks={data ?? []} projectId={""} />
            </TabsContent>
            {/* <TabsContent value="taskBoard">
              <TaskBoard taskIds={data} />
            </TabsContent> */}
          </Tabs>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-end gap-4 items-center mt-4">
          <Button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            variant="outline"
          >
            Previous
          </Button>
          {/* <span>
            Page {page} of {Math.ceil((data?.length ?? 0) / size)}
          </span> */}
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={size > Math.ceil(data?.length ?? 0)}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </SidebarInset>
  );
}
