import TaskList from "@/components/Project_Task/task-list";
import TaskBoard from "@/components/TaskBoard";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllTasks, getAllUsers, getTasksByUserId } from "@/lib/actions";
import { STORAGE_KEYS } from "@/lib/auth";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart2,
  ChevronDown,
  Filter,
  Search,
  Table,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/tasks/")({
  component: RouteComponent,
  loader: async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!userId) {
      throw new Error("User ID is not available in localStorage");
    }
    const taskIds = await getTasksByUserId(userId);
    return taskIds;
  },
});

function RouteComponent() {
  const taskIds = Route.useLoaderData();

  const [page, setPage] = useState(1); // Current page
  const [size] = useState(10); // Number of tasks per page
  const [search, setSearch] = useState<string | null>(null); // Search query

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>(
    []
  ); // List of assignees

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tasks",
      page,
      size,
      search,
      taskIds,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
    ],
    queryFn: async () => {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

      if (!userId) {
        throw new Error("User ID is not available in localStorage");
      }

      return await getAllTasks({
        userId,
        search,
        page,
        size,
        statuses: selectedStatus.length ? selectedStatus : null,
        priorities: selectedPriority.length ? selectedPriority : null,
        assigneeIds: selectedAssignee.length ? selectedAssignee : null,
      });
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

  const statuses = ["TO_DO", "IN_PROGRESS", "DONE"];
  const priorities = ["LOW", "MEDIUM", "HIGH"];

  // Fetch assignees when the component mounts
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const users = await getAllUsers({ page: 1, size: 100 }); // Fetch all users (adjust size as needed)
        const formattedAssignees = users.map((user) => ({
          id: user.id,
          name: user.name,
        }));
        setAssignees(formattedAssignees);
      } catch (error) {
        console.error("Failed to fetch assignees:", error);
      }
    };

    fetchAssignees();
  }, []);

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

      <div className="p-4">
        {/* Search and Pagination */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6 mb-6">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full lg:w-56 justify-between shadow-sm"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  {selectedStatus.length > 0 ? (
                    <span className="truncate max-w-[150px]">
                      {selectedStatus.join(", ")}
                    </span>
                  ) : (
                    "Filter by Status"
                  )}
                </div>
                {selectedStatus.length > 0 && (
                  <Badge variant="secondary" className="ml-1 mr-1">
                    {selectedStatus.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3">
              <div className="flex flex-col gap-2">
                {statuses.map((status) => (
                  <Label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                  >
                    <Checkbox
                      checked={selectedStatus.includes(status)}
                      onCheckedChange={(checked) => {
                        setSelectedStatus((prev) =>
                          checked
                            ? [...prev, status]
                            : prev.filter((s) => s !== status)
                        );
                        setPage(1);
                      }}
                    />
                    <span>{status}</span>
                  </Label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Priority Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full lg:w-56 justify-between shadow-sm"
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  {selectedPriority.length > 0 ? (
                    <span className="truncate max-w-[150px]">
                      {selectedPriority.join(", ")}
                    </span>
                  ) : (
                    "Filter by Priority"
                  )}
                </div>
                {selectedPriority.length > 0 && (
                  <Badge variant="secondary" className="ml-1 mr-1">
                    {selectedPriority.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3">
              <div className="flex flex-col gap-2">
                {priorities.map((priority) => (
                  <Label
                    key={priority}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                  >
                    <Checkbox
                      checked={selectedPriority.includes(priority)}
                      onCheckedChange={(checked) => {
                        setSelectedPriority((prev) =>
                          checked
                            ? [...prev, priority]
                            : prev.filter((p) => p !== priority)
                        );
                        setPage(1);
                      }}
                    />
                    <span>{priority}</span>
                  </Label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Assignee Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full lg:w-64 justify-between shadow-sm"
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  {selectedAssignee.length > 0 ? (
                    <span className="truncate max-w-[150px]">
                      {selectedAssignee
                        .map(
                          (id) => assignees.find((a) => a.id === id)?.name || id
                        )
                        .join(", ")}
                    </span>
                  ) : (
                    "Filter by Assignee"
                  )}
                </div>
                {selectedAssignee.length > 0 && (
                  <Badge variant="secondary" className="ml-1 mr-1">
                    {selectedAssignee.length}
                  </Badge>
                )}
                <ChevronDown className="h-4 w-4 ml-auto flex-shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="flex flex-col gap-2 max-h-60 overflow-auto">
                {assignees.map((assignee) => (
                  <Label
                    key={assignee.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                  >
                    <Checkbox
                      checked={selectedAssignee.includes(assignee.id)}
                      onCheckedChange={(checked) => {
                        setSelectedAssignee((prev) =>
                          checked
                            ? [...prev, assignee.id]
                            : prev.filter((id) => id !== assignee.id)
                        );
                        setPage(1);
                      }}
                    />
                    <span>{assignee.name}</span>
                  </Label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
              <TabsTrigger value="taskBoard">
                <BarChart2 />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="taskList">
              <TaskList tasks={data ?? []} projectId={""} />
            </TabsContent>
            <TabsContent value="taskBoard">
              <TaskBoard taskIds={taskIds} />
            </TabsContent>
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
