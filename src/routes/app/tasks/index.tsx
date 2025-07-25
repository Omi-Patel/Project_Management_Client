"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
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
import { getAllTasks, getAllUsers, getTasksByUserId, getAllProjects } from "@/lib/actions";
import { getWorkspacesForUser } from "@/lib/workspace-actions";
import { STORAGE_KEYS } from "@/lib/auth";
import { exportTasksToExcel } from "@/lib/export-report";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  BarChart2,
  ChevronDown,
  Download,
  Filter,
  Search,
  Table,
  X,
  Building2,
  FolderOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [search, setSearch] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>(
    []
  );
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string; workspaceId: string | null }[]>([]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = () => {
    try {
      setIsExporting(true);

      if (!data || data.length === 0) {
        toast.info("Nothing to export");
        setIsExporting(false);
        return;
      }

      let fileName = "my-tasks";

      if (search) {
        fileName += `-search-${search.replace(/[^a-z0-9]/gi, "_")}`;
      }

      if (selectedStatus.length > 0) {
        fileName += `-${selectedStatus.join("-")}`;
      }

      if (selectedPriority.length > 0) {
        fileName += `-${selectedPriority.join("-")}`;
      }

      exportTasksToExcel(data, assignees, fileName);

      toast.success("Export successful");
    } catch (error) {
      console.error("Error exporting tasks:", error);
      // Error handling is now done centrally in the actions file
    } finally {
      setIsExporting(false);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tasks",
      page,
      size,
      search,
      taskIds,
      selectedStatus,
      selectedPriority,
      selectedWorkspaces,
      selectedProjects,
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
      });
    },
    placeholderData: keepPreviousData,
  });

  // Filter tasks based on workspace and project selections
  const filteredData = data ? data.filter(task => {
    // Filter by workspace
    if (selectedWorkspaces.length > 0) {
      const taskWorkspaceId = task.project?.workspaceId;
      if (!taskWorkspaceId || !selectedWorkspaces.includes(taskWorkspaceId)) {
        return false;
      }
    }

    // Filter by project
    if (selectedProjects.length > 0) {
      if (!selectedProjects.includes(task.project?.id || '')) {
        return false;
      }
    }

    return true;
  }) : [];

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const statuses = ["TO_DO", "IN_PROGRESS", "DONE"];
  const priorities = ["LOW", "MEDIUM", "HIGH"];

  const clearAllFilters = () => {
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedWorkspaces([]);
    setSelectedProjects([]);
    setSearch(null);
    setPage(1);
  };

  const hasActiveFilters =
    selectedStatus.length > 0 ||
    selectedPriority.length > 0 ||
    selectedWorkspaces.length > 0 ||
    selectedProjects.length > 0 ||
    search;

  // Fetch workspaces, projects, and assignees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (!userId) return;

        // Fetch workspaces
        const workspacesData = await getWorkspacesForUser(userId);
        setWorkspaces(workspacesData.map(ws => ({ id: ws.id, name: ws.name })));

        // Fetch all projects
        const projectsData = await getAllProjects(userId);
        setProjects(projectsData
          .filter(p => p.id) // Filter out projects without ID
          .map(p => ({ 
            id: p.id!, 
            name: p.name, 
            workspaceId: p.workspaceId || null 
          })));

        // Fetch assignees
        const users = await getAllUsers({ page: 1, size: 100 });
        const formattedAssignees = users.map((user) => ({
          id: user.id,
          name: user.name,
        }));
        setAssignees(formattedAssignees);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Error handling is now done centrally in the actions file
      }
    };

    fetchData();
  }, []);

  return (
    <SidebarInset>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 px-4">
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

      <div className="p-4 space-y-6">
        {/* Page Title and Export */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track your assigned tasks
            </p>
          </div>
          <Button
            onClick={handleExportReport}
            disabled={isExporting || isLoading || !filteredData || filteredData.length === 0}
            className="flex items-center gap-2 shadow-sm"
            size="sm"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </div>

        {/* Filters Section */}
        <div className="bg-muted/30 rounded-lg border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">Filters & Search</h3>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tasks by title, description..."
              value={search || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between bg-background shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedStatus.length > 0
                        ? `Status (${selectedStatus.length})`
                        : "All Statuses"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Filter by Status</h4>
                  <Separator />
                  {statuses.map((status) => (
                    <Label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded-sm transition-colors"
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
                      <span className="text-sm">
                        {status.replace("_", " ")}
                      </span>
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
                  className="justify-between bg-background shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedPriority.length > 0
                        ? `Priority (${selectedPriority.length})`
                        : "All Priorities"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Filter by Priority</h4>
                  <Separator />
                  {priorities.map((priority) => (
                    <Label
                      key={priority}
                      className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded-sm transition-colors"
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
                      <span className="text-sm">{priority}</span>
                    </Label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Workspace Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between bg-background shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedWorkspaces.length > 0
                        ? `Workspace (${selectedWorkspaces.length})`
                        : "All Workspaces"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Filter by Workspace</h4>
                  <Separator />
                  <div className="max-h-48 overflow-auto space-y-1">
                    {workspaces.map((workspace) => (
                      <Label
                        key={workspace.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded-sm transition-colors"
                      >
                        <Checkbox
                          checked={selectedWorkspaces.includes(workspace.id)}
                          onCheckedChange={(checked) => {
                            setSelectedWorkspaces((prev) =>
                              checked
                                ? [...prev, workspace.id]
                                : prev.filter((id) => id !== workspace.id)
                            );
                            setPage(1);
                          }}
                        />
                        <span className="text-sm">{workspace.name}</span>
                      </Label>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Project Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between bg-background shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {selectedProjects.length > 0
                        ? `Project (${selectedProjects.length})`
                        : "All Projects"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Filter by Project</h4>
                  <Separator />
                  <div className="max-h-48 overflow-auto space-y-1">
                    {projects.map((project) => (
                      <Label
                        key={project.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1.5 rounded-sm transition-colors"
                      >
                        <Checkbox
                          checked={selectedProjects.includes(project.id)}
                          onCheckedChange={(checked) => {
                            setSelectedProjects((prev) =>
                              checked
                                ? [...prev, project.id]
                                : prev.filter((id) => id !== project.id)
                            );
                            setPage(1);
                          }}
                        />
                        <span className="text-sm">{project.name}</span>
                      </Label>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>


          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleSearch("")}
                  />
                </Badge>
              )}
              {selectedStatus.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1">
                  {status.replace("_", " ")}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() =>
                      setSelectedStatus((prev) =>
                        prev.filter((s) => s !== status)
                      )
                    }
                  />
                </Badge>
              ))}
              {selectedPriority.map((priority) => (
                <Badge key={priority} variant="secondary" className="gap-1">
                  {priority}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() =>
                      setSelectedPriority((prev) =>
                        prev.filter((p) => p !== priority)
                      )
                    }
                  />
                </Badge>
              ))}
              {selectedWorkspaces.map((workspaceId) => (
                <Badge key={workspaceId} variant="secondary" className="gap-1">
                  {workspaces.find((w) => w.id === workspaceId)?.name || workspaceId}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() =>
                      setSelectedWorkspaces((prev) =>
                        prev.filter((id) => id !== workspaceId)
                      )
                    }
                  />
                </Badge>
              ))}
              {selectedProjects.map((projectId) => (
                <Badge key={projectId} variant="secondary" className="gap-1">
                  {projects.find((p) => p.id === projectId)?.name || projectId}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() =>
                      setSelectedProjects((prev) =>
                        prev.filter((id) => id !== projectId)
                      )
                    }
                  />
                </Badge>
              ))}

            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-background border rounded-lg p-8">
            <LoadingScreen />
          </div>
        ) : error ? (
          <div className="bg-background border rounded-lg p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to load tasks
              </h3>
              <p className="text-muted-foreground">
                Please try refreshing the page
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-background border rounded-lg">
            <Tabs defaultValue="taskList" className="w-full">
              <div className="flex items-center justify-between p-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    Tasks {filteredData && `(${filteredData.length})`}
                  </h2>
                </div>
                <TabsList className="grid w-auto grid-cols-2">
                  <TabsTrigger
                    value="taskList"
                    className="flex items-center gap-2"
                  >
                    <Table className="h-4 w-4" />
                    List
                  </TabsTrigger>
                  <TabsTrigger
                    value="taskBoard"
                    className="flex items-center gap-2"
                  >
                    <BarChart2 className="h-4 w-4" />
                    Board
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="taskList" className="mt-0">
                  {filteredData && filteredData.length > 0 ? (
                    <TaskList tasks={filteredData} projectId={""} />
                  ) : (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No tasks found
                      </h3>
                      <p className="text-muted-foreground">
                        {hasActiveFilters
                          ? "Try adjusting your filters to see more tasks"
                          : "You don't have any tasks assigned yet"}
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="taskBoard" className="mt-0">
                  <TaskBoard taskIds={taskIds} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {/* Pagination */}
        {filteredData && filteredData.length > 0 && (
          <div className="flex items-center justify-between bg-muted/20 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(size, filteredData.length)} of {filteredData.length} tasks
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-3 py-1 bg-background rounded border">
                <span className="text-sm font-medium">{page}</span>
              </div>
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={size > Math.ceil(filteredData?.length ?? 0)}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </SidebarInset>
  );
}

export default RouteComponent;
