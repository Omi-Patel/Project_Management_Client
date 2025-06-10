"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
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
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  FolderKanban,
  ListTodo,
  Shield,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle2,
  Timer,
  BarChart3,
  PieChart,
} from "lucide-react";
import { getAllUsers, getAllProjects, getAllTasks } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app/admin-portal/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getAllUsers({ page: 1, size: 1000 }),
  });

  // Fetch all projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getAllProjects(""),
  });

  // Fetch all tasks
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => getAllTasks({ userId: "", page: 1, size: 1000 }),
  });

  if (initialLoading) {
    return <LoadingScreen />;
  }

  // Calculate comprehensive statistics
  const totalUsers = users?.length || 0;
  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;

  // Task distribution
  const taskDistribution = {
    todo: tasks?.filter((task) => task.status === "TO_DO").length || 0,
    inProgress:
      tasks?.filter((task) => task.status === "IN_PROGRESS").length || 0,
    done: tasks?.filter((task) => task.status === "DONE").length || 0,
  };

  const totalTaskCount =
    taskDistribution.todo + taskDistribution.inProgress + taskDistribution.done;
  const taskPercentages = {
    todo: totalTaskCount
      ? Math.round((taskDistribution.todo / totalTaskCount) * 100)
      : 0,
    inProgress: totalTaskCount
      ? Math.round((taskDistribution.inProgress / totalTaskCount) * 100)
      : 0,
    done: totalTaskCount
      ? Math.round((taskDistribution.done / totalTaskCount) * 100)
      : 0,
  };

  // Advanced analytics
  const avgTasksPerUser =
    totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : "0";
  const avgTasksPerProject =
    totalProjects > 0 ? (totalTasks / totalProjects).toFixed(1) : "0";
  const completionRate = taskPercentages.done;
  const productivityScore = Math.min(
    100,
    Math.round((completionRate + totalTasks / Math.max(totalUsers, 1)) * 0.8)
  );

  const isDataLoading = isLoadingUsers || isLoadingProjects || isLoadingTasks;

  return (
    <SidebarInset>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 text-white/90 hover:text-white transition-colors" />
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="#"
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    Admin Portal
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-white/30" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-white">
                    Analytics Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-8">
        {/* Hero Analytics Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">System Analytics</h1>
                    <p className="text-white/70">
                      Real-time insights and performance metrics
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{productivityScore}</div>
                  <div className="text-sm text-white/70">
                    Productivity Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <div className="text-sm text-white/70">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
          <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
        </div>

        {isDataLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-muted/50">
                  <Skeleton className="h-4 w-20 mb-4" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Users
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-blue-500/5" />
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/10 rounded-xl">
                    <FolderKanban className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {totalProjects.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Projects
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-green-500/5" />
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500/10 rounded-xl">
                    <ListTodo className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {totalTasks.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tasks
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-orange-500/5" />
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-6 transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {completionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completion Rate
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 h-16 w-16 rounded-full bg-purple-500/5" />
              </div>
            </div>

            {/* Advanced Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Task Status Visualization */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Task Distribution Analysis
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Current workflow status breakdown
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PieChart className="h-4 w-4" />
                    Live Data
                  </div>
                </div>

                <div className="space-y-6">
                  {/* To Do Tasks */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">Pending Tasks</div>
                          <div className="text-sm text-muted-foreground">
                            {taskDistribution.todo} tasks waiting
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {taskPercentages.todo}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of total
                        </div>
                      </div>
                    </div>
                    <div className="relative h-2 bg-red-100 dark:bg-red-900/30 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                        style={{ width: `${taskPercentages.todo}%` }}
                      />
                    </div>
                  </div>

                  {/* In Progress Tasks */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                          <Timer className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-medium">In Progress</div>
                          <div className="text-sm text-muted-foreground">
                            {taskDistribution.inProgress} tasks active
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {taskPercentages.inProgress}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of total
                        </div>
                      </div>
                    </div>
                    <div className="relative h-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full transition-all duration-1000"
                        style={{ width: `${taskPercentages.inProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Completed Tasks */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Completed</div>
                          <div className="text-sm text-muted-foreground">
                            {taskDistribution.done} tasks finished
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {taskPercentages.done}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          of total
                        </div>
                      </div>
                    </div>
                    <div className="relative h-2 bg-green-100 dark:bg-green-900/30 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                        style={{ width: `${taskPercentages.done}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Performance Insights
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Key productivity metrics
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          Productivity Score
                        </span>
                      </div>
                      <span className="text-lg font-bold text-blue-600">
                        {productivityScore}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Based on completion rate and task distribution
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">
                          Tasks per User
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {avgTasksPerUser}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Average workload distribution
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">
                          Tasks per Project
                        </span>
                      </div>
                      <span className="text-lg font-bold text-purple-600">
                        {avgTasksPerProject}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Project complexity indicator
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium">
                          Success Rate
                        </span>
                      </div>
                      <span className="text-lg font-bold text-orange-600">
                        {completionRate}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Overall task completion efficiency
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Data Visualizations */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Advanced Analytics</h2>
                  <p className="text-muted-foreground">
                    Comprehensive data visualizations and trends
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  Interactive Charts
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                {/* Task Status Pie Chart - Improved */}
                <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/80 dark:to-gray-800/80 p-5 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-gradient-to-b from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
                        <h3 className="text-lg md:text-xl font-semibold">
                          Task Status Distribution
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Current task breakdown by status
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">Live Data</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative h-full w-full group">
                      <svg
                        viewBox="0 0 200 200"
                        className="w-full h-full drop-shadow-sm"
                      >
                        {/* Background circle for better visual appearance */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="hsl(220, 14%, 96%)"
                          strokeWidth="20"
                          className="dark:opacity-10"
                        />
                        {/* To Do tasks */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="hsl(0, 84%, 60%)"
                          strokeWidth="20"
                          strokeDasharray={`${taskPercentages.todo * 5.03} 502`}
                          strokeDashoffset="0"
                          transform="rotate(-90 100 100)"
                          className="transition-all duration-1000 hover:opacity-90"
                        >
                          <title>To Do: {taskPercentages.todo}%</title>
                        </circle>
                        {/* In Progress tasks */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="hsl(45, 93%, 47%)"
                          strokeWidth="20"
                          strokeDasharray={`${taskPercentages.inProgress * 5.03} 502`}
                          strokeDashoffset={`-${taskPercentages.todo * 5.03}`}
                          transform="rotate(-90 100 100)"
                          className="transition-all duration-1000 hover:opacity-90"
                        >
                          <title>
                            In Progress: {taskPercentages.inProgress}%
                          </title>
                        </circle>
                        {/* Done tasks */}
                        <circle
                          cx="100"
                          cy="100"
                          r="80"
                          fill="none"
                          stroke="hsl(142, 76%, 36%)"
                          strokeWidth="20"
                          strokeDasharray={`${taskPercentages.done * 5.03} 502`}
                          strokeDashoffset={`-${(taskPercentages.todo + taskPercentages.inProgress) * 5.03}`}
                          transform="rotate(-90 100 100)"
                          className="transition-all duration-1000 hover:opacity-90"
                        >
                          <title>Done: {taskPercentages.done}%</title>
                        </circle>
                        {/* Center text */}
                        <g className="transition-transform duration-300 group-hover:scale-110">
                          <text
                            x="100"
                            y="90"
                            textAnchor="middle"
                            className="text-3xl font-bold fill-foreground"
                          >
                            {totalTasks}
                          </text>
                          <text
                            x="100"
                            y="115"
                            textAnchor="middle"
                            className="text-sm fill-muted-foreground"
                          >
                            Total Tasks
                          </text>
                        </g>
                      </svg>
                    </div>

                    <div className="w-full md:w-1/2 space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm font-medium">To Do</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {taskDistribution.todo}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {taskPercentages.todo}% of total
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm font-medium">
                            In Progress
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {taskDistribution.inProgress}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {taskPercentages.inProgress}% of total
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm font-medium">Done</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {taskDistribution.done}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {taskPercentages.done}% of total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productivity Analytics Bar Chart - Improved */}
                <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900/80 dark:to-gray-800/80 p-5 md:p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-gradient-to-b from-blue-500 via-green-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-lg md:text-xl font-semibold">
                          Productivity Metrics
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Key performance indicators analysis
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">Performance</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 h-[300px]">
                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex items-end justify-center  relative group min-h-[200px]">
                        <div className="absolute inset-x-0 bottom-0 flex justify-center h-[200px]">
                          <div className="w-full max-w-[40px] bg-blue-100 dark:bg-blue-900/20 rounded-t-lg h-full" />
                        </div>
                        <div
                          className="relative w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-1000 group-hover:from-blue-700 group-hover:to-blue-500 shadow-lg z-10"
                          style={{ height: `${productivityScore}%` }}
                        >
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {productivityScore}
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          <span className="text-xs font-medium">
                            Productivity
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          {productivityScore}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex items-end justify-center  relative group min-h-[200px]">
                        <div className="absolute inset-x-0 bottom-0 flex justify-center h-[200px]">
                          <div className="w-full max-w-[40px] bg-green-100 dark:bg-green-900/20 rounded-t-lg h-full" />
                        </div>
                        <div
                          className="relative w-full max-w-[40px] bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-1000 group-hover:from-green-700 group-hover:to-green-500 shadow-lg z-10"
                          style={{ height: `${completionRate}%` }}
                        >
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {completionRate}%
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-xs font-medium">
                            Completion
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          {completionRate}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex items-end justify-center  relative group min-h-[200px]">
                        <div className="absolute inset-x-0 bottom-0 flex justify-center h-[200px]">
                          <div className="w-full max-w-[40px] bg-orange-100 dark:bg-orange-900/20 rounded-t-lg h-full" />
                        </div>
                        <div
                          className="relative w-full max-w-[40px] bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg transition-all duration-1000 group-hover:from-orange-700 group-hover:to-orange-500 shadow-lg z-10"
                          style={{
                            height: `${Math.min(100, Math.round((totalTasks / Math.max(totalProjects, 1)) * 10))}%`,
                          }}
                        >
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {Math.min(
                              100,
                              Math.round(
                                (totalTasks / Math.max(totalProjects, 1)) * 10
                              )
                            )}
                            %
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                          <span className="text-xs font-medium">
                            Efficiency
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          {Math.min(
                            100,
                            Math.round(
                              (totalTasks / Math.max(totalProjects, 1)) * 10
                            )
                          )}
                          %
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex items-end justify-center relative group min-h-[200px]">
                        <div className="absolute inset-x-0 bottom-0 flex justify-center h-[200px]">
                          <div className="w-full max-w-[40px] bg-purple-100 dark:bg-purple-900/20 rounded-t-lg h-full" />
                        </div>
                        <div
                          className="relative w-full max-w-[40px] bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-1000 group-hover:from-purple-700 group-hover:to-purple-500 shadow-lg z-10"
                          style={{
                            height: `${Math.min(100, Math.round((totalUsers / Math.max(totalProjects, 1)) * 20))}%`,
                          }}
                        >
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {Math.min(
                              100,
                              Math.round(
                                (totalUsers / Math.max(totalProjects, 1)) * 20
                              )
                            )}
                            %
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-3">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          <span className="text-xs font-medium">
                            Utilization
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          {Math.min(
                            100,
                            Math.round(
                              (totalUsers / Math.max(totalProjects, 1)) * 20
                            )
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SidebarInset>
  );
}
