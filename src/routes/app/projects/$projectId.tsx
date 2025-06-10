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
import { useState, useEffect } from "react";
import TaskList from "@/components/Project_Task/task-list";
import { TaskFormDialog } from "@/components/Project_Task/task-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart2,
  Table,
  ClockIcon,
  ListTodo,
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  Target,
  Calendar,
} from "lucide-react";
import TaskBoard from "@/components/TaskBoard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  const router = useRouter();
  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [search, setSearch] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Fetch tasks using getAllTasks
  const { data, isLoading, error } = useQuery({
    queryKey: ["tasks", projectId, page, size, search],
    queryFn: async () => {
      return await getAllTasksByProjectId({ projectId, search, page, size });
    },
    placeholderData: keepPreviousData,
  });

  // Calculate project progress and timeline status
  useEffect(() => {
    if (project) {
      if (project && data) {
        const completedTasks =
          data.filter((task) => task.status === "DONE").length || 0;
        const totalTasks = data.length || 0;

        if (totalTasks === 0) {
          setProgress(0); // No tasks, progress is 0%
        } else {
          const progressPercentage = Math.round(
            (completedTasks / totalTasks) * 100
          );
          setProgress(progressPercentage);
        }
      }
    }
  }, [project, data]);

  const handleTaskAdded = async () => {
    setIsAddDialogOpen(false);
    router.invalidate();
  };

  const handleSearch = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDate = (date: number | string | null | undefined) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!project.endDate) return null;

    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  // Get status label and color
  const getStatusInfo = () => {
    if (daysRemaining === null)
      return {
        label: "No Deadline",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
      };

    if (daysRemaining < 0) {
      return {
        label: "Overdue",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      };
    } else if (daysRemaining === 0) {
      return {
        label: "Due Today",
        variant: "default" as const,
        className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      };
    } else if (daysRemaining <= 7) {
      return {
        label: "Due Soon",
        variant: "default" as const,
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      };
    } else {
      return {
        label: "On Track",
        variant: "default" as const,
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      };
    }
  };

  const statusInfo = getStatusInfo();

  // Count completed tasks
  const completedTasks =
    data?.filter((task) => task.status === "DONE")?.length || 0;
  const totalTasks = data?.length || 0;
  const taskCompletion =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <SidebarInset className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:flex cursor-pointer items-center">
                  <BreadcrumbLink
                    onClick={() => navigate({ to: "/app/projects" })}
                    className="flex items-center hover:text-primary transition-colors"
                  >
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {project.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-8 p-6 pb-16">
        {/* Project Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              <p className="text-muted-foreground">
                {project.description || "No description available"}
              </p>
            </div>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
        </div>

        {/* Project Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Progress</h3>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{progress}%</div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Start Date</h3>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatDate(project.startDate)}
              </div>
              <p className="text-xs text-muted-foreground">Project kickoff</p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">End Date</h3>
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatDate(project.endDate)}
              </div>
              <p className="text-xs text-muted-foreground">
                {daysRemaining !== null
                  ? daysRemaining >= 0
                    ? `${daysRemaining} days remaining`
                    : `${Math.abs(daysRemaining)} days overdue`
                  : "No deadline set"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Tasks</h3>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {taskCompletion}% completion rate
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Project Tasks</h2>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Task
            </Button>
          </div>
          <div className="p-6 space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search || ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">
                    Loading tasks...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">
                  Failed to load tasks. Please try again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabs */}
                <Tabs defaultValue="taskList" className="space-y-4">
                  <div className="flex justify-end">
                    <TabsList>
                      <TabsTrigger value="taskList" className="gap-2">
                        <Table className="h-4 w-4" />
                        List View
                      </TabsTrigger>
                      <TabsTrigger value="taskBoard" className="gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Board View
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="taskList" className="space-y-4">
                    <TaskList tasks={data ?? []} projectId={projectId} />
                  </TabsContent>

                  <TabsContent value="taskBoard" className="space-y-4">
                    <TaskBoard taskIds={data?.map((task) => task.id) ?? []} />
                  </TabsContent>
                </Tabs>

                {/* Pagination */}
                {data && data.length > 0 && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {Math.min((page - 1) * size + 1, data.length)} to{" "}
                      {Math.min(page * size, data.length)} of {data.length}{" "}
                      tasks
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={size > Math.ceil(data?.length ?? 0)}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

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
