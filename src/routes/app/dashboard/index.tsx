"use client";

import { createFileRoute, redirect } from "@tanstack/react-router";
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
import {
  getWorkspacesForUser,
  getWorkspaceMembers,
} from "@/lib/workspace-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  Star,
  Zap,
  Building2,
  Globe,
  MessageSquare,
  FileText,
  PieChart,
  LineChart,
  Target as TargetIcon,
  Award,
  Lightbulb,
  Settings,
  Plus,
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
  const router = useRouter();
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });

  // Fetch user's tasks
  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", userId],
    queryFn: () => getAllTasks({ userId: userId!, page: 1, size: 1000 }),
    enabled: !!userId,
  });

  // Fetch user's projects
  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects", userId],
    queryFn: () => getAllProjects(userId!),
    enabled: !!userId,
  });

  // Fetch user's workspaces
  const { data: workspaces, isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ["workspaces", userId],
    queryFn: () => getWorkspacesForUser(userId!),
    enabled: !!userId,
  });

  const isLoading =
    isUserLoading || isTasksLoading || isProjectsLoading || isWorkspacesLoading;

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Calculate comprehensive statistics
  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((task) => task.status === "DONE").length || 0;
  const inProgressTasks =
    tasks?.filter((task) => task.status === "IN_PROGRESS").length || 0;
  const todoTasks =
    tasks?.filter((task) => task.status === "TO_DO").length || 0;
  const overdueTasks =
    tasks?.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== "DONE";
    }).length || 0;

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalProjects = projects?.length || 0;
  const totalWorkspaces = workspaces?.length || 0;

  // Calculate productivity metrics
  const highPriorityTasks =
    tasks?.filter((task) => task.priority === "HIGH").length || 0;
  const mediumPriorityTasks =
    tasks?.filter((task) => task.priority === "MEDIUM").length || 0;
  const lowPriorityTasks =
    tasks?.filter((task) => task.priority === "LOW").length || 0;

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentTasks =
    tasks?.filter((task) => {
      if (!task.updatedAt) return false;
      return new Date(task.updatedAt) >= sevenDaysAgo;
    }).length || 0;

  // Get recent projects (last 3)
  const recentProjects = projects?.slice(0, 3) || [];

  // Get recent workspaces (last 3)
  const recentWorkspaces = workspaces?.slice(0, 3) || [];

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

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <div className="p-6 space-y-8">
          {/* Enhanced Hero Welcome Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">
                        Welcome back, {user?.name || "User"}!
                      </h1>
                      <p className="text-white/70">
                        Here's your comprehensive project management overview
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
                    <div className="text-2xl font-bold">{totalWorkspaces}</div>
                    <div className="text-sm text-white/70">Workspaces</div>
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

          {/* Enhanced Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Tasks Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-800">
                  <ListTodo className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {totalTasks}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-xs text-green-600 font-medium">
                  +{recentTasks} this week
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-blue-500/5" />
            </div>

            {/* Active Projects Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-xl border border-green-200 dark:border-green-800">
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
                <div className="text-xs text-blue-600 font-medium">
                  Across {totalWorkspaces} workspaces
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-green-500/5" />
            </div>

            {/* Completion Rate Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-800">
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Completion Rate
                </div>
                <div className="text-xs text-orange-600 font-medium">
                  {completedTasks} completed
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-orange-500/5" />
            </div>

            {/* Workspaces Metric */}
            <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-800">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {totalWorkspaces}
                </div>
                <div className="text-sm text-muted-foreground">Workspaces</div>
                <div className="text-xs text-purple-600 font-medium">
                  Collaborative spaces
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-purple-500/5" />
            </div>
          </div>

          {/* Enhanced Analytics Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Task Status Visualization */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-800">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Task Progress Overview</h2>
                  <p className="text-muted-foreground">
                    Detailed breakdown of task statuses and priorities
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Status Progress Bars */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">To Do</span>
                      <span className="text-sm text-muted-foreground">
                        {todoTasks} (
                        {totalTasks > 0
                          ? Math.round((todoTasks / totalTasks) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <Progress
                      value={
                        totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0
                      }
                      className="h-3"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">In Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {inProgressTasks} (
                        {totalTasks > 0
                          ? Math.round((inProgressTasks / totalTasks) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                    <Progress
                      value={
                        totalTasks > 0
                          ? (inProgressTasks / totalTasks) * 100
                          : 0
                      }
                      className="h-3"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold">Completed</span>
                      <span className="text-sm text-muted-foreground">
                        {completedTasks} ({completionRate}%)
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                  </div>
                </div>

                {/* Priority Distribution */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold mb-4">
                    Priority Distribution
                  </h4>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600">
                        {highPriorityTasks}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        High Priority
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-2xl font-bold text-yellow-600">
                        {mediumPriorityTasks}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Medium Priority
                      </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600">
                        {lowPriorityTasks}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        Low Priority
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-800">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Performance Insights</h2>
                  <p className="text-muted-foreground">
                    Your productivity metrics
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Weekly Progress */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">
                      Weekly Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {recentTasks} tasks
                    </span>
                  </div>
                  <Progress
                    value={
                      recentTasks > 0
                        ? Math.min((recentTasks / 10) * 100, 100)
                        : 0
                    }
                    className="h-3"
                  />
                </div>

                {/* Efficiency Score */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600">
                      {completionRate}%
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Efficiency
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalWorkspaces}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      Collaboration
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold mb-4">
                    Recent Achievements
                  </h4>
                  <div className="space-y-3">
                    {completedTasks > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="h-4 w-4 text-yellow-600" />
                        <span>Completed {completedTasks} tasks</span>
                      </div>
                    )}
                    {totalWorkspaces > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Joined {totalWorkspaces} workspaces</span>
                      </div>
                    )}
                    {totalProjects > 0 && (
                      <div className="flex items-center gap-3 text-sm">
                        <FolderKanban className="h-4 w-4 text-green-600" />
                        <span>Created {totalProjects} projects</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Productivity Tips */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold mb-4">
                    Productivity Tips
                  </h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span>Focus on high-priority tasks first</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <TargetIcon className="h-4 w-4 text-blue-600" />
                      <span>Set realistic deadlines</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-green-600" />
                      <span>Collaborate with your team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace & Project Overview */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Workspaces */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Your Workspaces</h2>
                    <p className="text-muted-foreground">
                      Collaborative environments
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.navigate({ to: "/app/workspaces" })}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {recentWorkspaces.length > 0 ? (
                  recentWorkspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-800">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{workspace.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {workspace.memberCount} members •{" "}
                              {workspace.projectCount} projects
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.navigate({
                              to: `/app/workspace/${workspace.id}`,
                            })
                          }
                        >
                          Open
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No workspaces found
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.navigate({ to: "/app/workspaces" })}
                    >
                      Create Workspace
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-200 dark:border-green-800">
                    <FolderKanban className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Recent Projects</h2>
                    <p className="text-muted-foreground">
                      Your active project work
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.navigate({ to: "/app/projects" })}
                >
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-500/10 rounded-xl border border-green-200 dark:border-green-800">
                            <FolderKanban className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description || "No description"}
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
                          Open
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-4">
                      <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No projects found
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => router.navigate({ to: "/app/projects" })}
                    >
                      Create Project
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity & Performance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Activity Feed */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-800">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                  <p className="text-muted-foreground">
                    Latest updates and changes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {tasks && tasks.length > 0 ? (
                  <>
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-800">
                            <ListTodo className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">
                              {task.title}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {task.project?.name || "No project"}
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
                      className="w-full h-12"
                      onClick={() => router.navigate({ to: "/app/tasks" })}
                    >
                      View All Tasks
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-fit mx-auto mb-4">
                      <ListTodo className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
}

export default RouteComponent;
