"use client";

import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { STORAGE_KEYS } from "@/lib/auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getAllTasks, getAllProjects, getUserById } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Target,
  ArrowRight,
  BarChart3,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/app/dashboard/")({
  component: RouteComponent,
  loader: async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!userId) {
      return redirect({ to: "/auth/login" });
    }
  },
});

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });

  // Fetch user's tasks
  const { data: tasks } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => getAllTasks({ userId: userId!, page: 1, size: 1000 }),
    enabled: !!userId,
  });

  // Fetch user's projects
  const { data: projects } = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => getAllProjects(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Calculate statistics
  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((task) => task.status === "DONE").length || 0;
  const inProgressTasks =
    tasks?.filter((task) => task.status === "IN_PROGRESS").length || 0;
  const todoTasks =
    tasks?.filter((task) => task.status === "TO_DO").length || 0;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalProjects = projects?.length || 0;

  return (
    <SidebarInset>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">
                  Overview
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <main className="min-h-screen bg-background">
        <div className="p-6 space-y-8">
          {/* Hero Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">
                        Welcome back, {user?.name || "User"}!
                      </h1>
                      <p className="text-white/70">
                        Here's an overview of your tasks and projects
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{completionRate}%</div>
                    <div className="text-sm text-white/70">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{totalTasks}</div>
                    <div className="text-sm text-white/70">Total Tasks</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Tasks Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-6 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <ListTodo className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {totalTasks}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-blue-500/5" />
            </div>

            {/* Active Projects Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-6 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <FolderKanban className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {totalProjects}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Projects
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-green-500/5" />
            </div>

            {/* Completed Tasks Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-6 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-500/10 rounded-xl">
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {completedTasks}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-orange-500/5" />
            </div>

            {/* In Progress Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-6 transition-all hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {inProgressTasks}
                </div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-purple-500/5" />
            </div>
          </div>

          {/* Task Status and Activity Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Task Status Visualization */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Task Progress</h2>
              </div>

              <div className="space-y-6">
                {/* To Do Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">To Do</span>
                    <span className="text-sm text-muted-foreground">
                      {todoTasks} (
                      {totalTasks > 0
                        ? Math.round((todoTasks / totalTasks) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{
                        width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* In Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {inProgressTasks} (
                      {totalTasks > 0
                        ? Math.round((inProgressTasks / totalTasks) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 rounded-full"
                      style={{
                        width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Completed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-muted-foreground">
                      {completedTasks} ({completionRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-xl">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold">Recent Activity</h2>
              </div>

              <div className="space-y-4">
                {tasks && tasks.length > 0 ? (
                  <>
                    {tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-500/10 rounded-xl">
                            <ListTodo className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{task.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {task.project.name}
                            </p>
                          </div>
                          <Badge
                            variant={
                              task.status === "DONE" ? "default" : "secondary"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className=""
                      onClick={() => router.navigate({ to: "/app/tasks" })}
                    >
                      View All Tasks
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                      <ListTodo className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No tasks found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects Showcase */}
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <FolderKanban className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold">Your Projects</h2>
            </div>

            <div className="space-y-4">
              {projects && projects.length > 0 ? (
                <>
                  {projects.slice(0, 3).map((project) => (
                    <div
                      key={project.id}
                      className=" p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex flex-col sm:flex-row items- justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="p-2 bg-green-500/10 rounded-xl">
                            <FolderKanban className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description ||
                                "No description available"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.navigate({
                              to: `/app/projects/${project.id}`,
                            })
                          }
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className=""
                    onClick={() => router.navigate({ to: "/app/projects" })}
                  >
                    Explore All Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                    <FolderKanban className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No projects found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}

export default RouteComponent;
