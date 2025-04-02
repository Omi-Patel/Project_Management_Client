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
  CalendarIcon,
  ClockIcon,
  ListTodo,
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import TaskBoard from "@/components/TaskBoard";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

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
      return { label: "No Deadline", color: "bg-gray-100 text-gray-600" };

    if (daysRemaining < 0) {
      return { label: "Overdue", color: "bg-red-100 text-red-800" };
    } else if (daysRemaining === 0) {
      return { label: "Due Today", color: "bg-orange-100 text-orange-800" };
    } else if (daysRemaining <= 7) {
      return { label: "Due Soon", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "On Track", color: "bg-green-100 text-green-800" };
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
    <SidebarInset className="">
      <header className="flex h-16 shrink-0 items-center gap-2 ">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:flex cursor-pointer items-center">
                  <BreadcrumbLink
                    onClick={() => navigate({ to: "/app/projects" })}
                    className="flex items-center "
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


      <div className="container max-w-7xl mx-auto pb-12">
        {/* Project Overview Card */}
        <div className="mt-6 mb-6">
          <div className="">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Project Overview
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>

            <div className="p-6">
              {/* Project Name and Timeline */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {project.name}
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                    <p className="text-gray-700 dark:text-gray-300">
                      {project.description || "No description available"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <div className="flex items-center mb-1">
                        <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Start Date
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(project.startDate)}
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
                      <div className="flex items-center mb-1">
                        <ClockIcon className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDate(project.endDate)}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-100 dark:border-green-800/50">
                      <div className="flex items-center mb-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tasks Completed
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {completedTasks} of {totalTasks} ({taskCompletion}%)
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg border border-amber-100 dark:border-amber-800/50">
                      <div className="flex items-center mb-1">
                        <ListTodo className="h-4 w-4 text-amber-600 dark:text-amber-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Timeline
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {daysRemaining !== null
                          ? daysRemaining >= 0
                            ? `${daysRemaining} days left`
                            : `${Math.abs(daysRemaining)} days overdue`
                          : "No deadline set"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white shadow-md dark:bg-gray-800">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <ListTodo className="h-5 w-5 mr-2 text-blue-600" />
              Project Tasks
            </h2>

            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-primary"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Task
            </Button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-full bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-800 dark:text-red-300 p-4 rounded-lg text-center">
                Failed to load tasks. Please try again.
              </div>
            ) : (
              <Tabs defaultValue="taskList" className="flex flex-col">
                {/* Tabs List - Aligned to Right */}
                <div className="flex justify-end">
                  <TabsList className="bg-gray-100 dark:bg-gray-700 ml-auto">
                    <TabsTrigger
                      value="taskList"
                      className="flex items-center gap-1"
                    >
                      <Table className="h-4 w-4" /> List
                    </TabsTrigger>
                    <TabsTrigger
                      value="taskBoard"
                      className="flex items-center gap-1"
                    >
                      <BarChart2 className="h-4 w-4" /> Board
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tabs Content */}
                <TabsContent value="taskList" className="mt-4">
                  <TaskList tasks={data ?? []} projectId={projectId} />
                </TabsContent>
                <TabsContent value="taskBoard" className="mt-4">
                  <TaskBoard taskIds={data?.map((task) => task.id) ?? []} />
                </TabsContent>
              </Tabs>
            )}

            {/* Pagination */}
            {data && data.length > 0 && (
              <div className="flex justify-between items-center mt-6 border-t pt-4">
                <div className="text-sm text-gray-500">
                  Showing {Math.min((page - 1) * size + 1, data.length)} to{" "}
                  {Math.min(page * size, data.length)} of {data.length} tasks
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= Math.ceil((data?.length ?? 0) / size)}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
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
