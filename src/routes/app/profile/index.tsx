"use client";

import { LoadingScreen } from "@/components/LoadingScreen";
import ProfileChart from "@/components/ProfileChart";
import ProfileEditForm from "@/components/ProfileEditForm";
import TaskList from "@/components/Project_Task/task-list";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllTasks, getUserById } from "@/lib/actions";
import { STORAGE_KEYS } from "@/lib/auth";
import { getStatusColor } from "@/lib/task-utils";
import type { ListTaskRequest } from "@/schemas/task_schema";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Edit,
  Mail,
  Phone,
  User,
  CheckCircle,
  ListChecks,
  ClipboardList,
  Calendar,
  BarChart3,
  Clock3,
  Shield,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/profile/")({
  component: RouteComponent,
  loader: async () => {
    const userId = await localStorage.getItem(STORAGE_KEYS.USER_ID);

    return { userId };
  },
});

function RouteComponent() {
  const { userId } = Route.useLoaderData();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const formatDate = (timestamp: any) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
  });

  // Fetch tasks data
  const taskParams: ListTaskRequest = {
    page: 1,
    size: 5,
    search: null,
    userId: userId ?? "",
  };

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", taskParams],
    queryFn: () => getAllTasks({ ...taskParams, userId: userId! }),
    enabled: !!userId,
  });

  const getInitials = (name: any) => {
    return name
      .split(" ")
      .map((part: any) => part[0])
      .join("")
      .toUpperCase();
  };

  // Calculate task stats
  const getTotalTasks = () => tasks?.length || 0;
  const getCompletedTasks = () =>
    tasks?.filter((t) => t.status === "DONE").length || 0;
  const getPendingTasks = () =>
    tasks?.filter((t) => t.status === "TO_DO" || t.status === "IN_PROGRESS")
      .length || 0;

  if (isUserLoading || isTasksLoading || !user || !tasks) {
    return <LoadingScreen />;
  }

  return (
    <SidebarInset className="">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:flex cursor-pointer items-center">
                  <BreadcrumbLink className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                    <User className="h-4 w-4 mr-1" /> My Profile
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {user?.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      <Separator />

      <div className="container mx-auto  ">
        <div className="overflow-hidden bg-background  shadow-lg">
          <div className="h-48 bg-gradient-to-r from-violet-600 to-indigo-600 relative">
            <div className="absolute -bottom-20 left-8">
              <Avatar className="h-40 w-40 border-4 border-white dark:border-gray-800 shadow-xl">
                <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800 font-bold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute top-6 right-6">
              <Badge
                className={`${getStatusColor(
                  user.status || "unknown"
                )} text-white text-sm font-bold capitalize rounded-full`}
              >
                {user?.status}
              </Badge>
            </div>
          </div>

          <CardHeader className="pt-24 pb-4 px-8 bg-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground mb-1">
                  <div className="flex items-center gap-2">
                    <span>{user?.name}</span>
                    <span className="text-xl text-muted-foreground">
                      | {user?.role}
                    </span>
                  </div>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg mb-2">
                  Task Management Dashboard
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>Member Since: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
              <Button
                className="gap-2 bg-primary px-5 py-2 h-auto rounded-lg shadow-md transition-all hover:shadow-lg"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 p-8 bg-card">
            <div className="bg-muted/50 rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground">
                <div className="flex items-center gap-3 bg-background p-4 rounded-lg shadow-sm border border-border">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-background p-4 rounded-lg shadow-sm border border-border">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {user.phoneNumber || "No phone number provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 bg-secondary p-1 rounded-lg shadow-sm">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-6 py-2 transition-all text-muted-foreground hover:text-foreground"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-background dark:data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-6 py-2 transition-all text-muted-foreground hover:text-foreground"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Tasks */}
                  <div className="flex flex-col items-start p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg shadow-md border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-200 dark:bg-indigo-800 p-3 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Total Tasks
                      </h3>
                    </div>
                    <span className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-2">
                      {getTotalTasks()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total assigned tasks
                    </p>
                  </div>

                  {/* Completed Tasks */}
                  <div className="flex flex-col items-start p-6 bg-green-50 dark:bg-green-900/10 rounded-lg shadow-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-200 dark:bg-green-800 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Completed
                      </h3>
                    </div>
                    <span className="text-4xl font-extrabold text-green-700 dark:text-green-300 mt-2">
                      {getCompletedTasks()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tasks completed
                    </p>
                  </div>

                  {/* Pending Tasks */}
                  <div className="flex flex-col items-start p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg shadow-md border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-200 dark:bg-yellow-800 p-3 rounded-lg">
                        <Clock3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Pending
                      </h3>
                    </div>
                    <span className="text-4xl font-extrabold text-yellow-700 dark:text-yellow-300 mt-2">
                      {getPendingTasks()}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tasks in progress
                    </p>
                  </div>
                </div>

                {/* Task Distribution Chart */}
                <div className="p-6 bg-background rounded-xl shadow-md border border-border">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Task Distribution
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Breakdown of your tasks by status
                      </p>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ProfileChart tasks={tasks} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tasks">
                <div className="overflow-hidden bg-background rounded-xl shadow-md border border-border">
                  {/* Header Section */}
                  <div className="flex items-center px-6 py-4 bg-muted/50 border-b border-border">
                    <ListChecks className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Recent Tasks
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your most recent tasks and their status
                      </p>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="p-4">
                    <TaskList tasks={tasks} projectId="" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {user && (
        <ProfileEditForm
          user={user}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </SidebarInset>
  );
}
