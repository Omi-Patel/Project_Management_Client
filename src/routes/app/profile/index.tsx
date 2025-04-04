"use client";

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
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg max-w-md animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <h2 className="text-2xl font-semibold mb-2">Loading profile...</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we fetch your data.
          </p>
          <div className="mt-6 h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mx-auto"></div>
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <SidebarInset className="">
      <header className="flex h-16 shrink-0 items-center gap-2 px-6  relative">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:flex cursor-pointer items-center">
                  <BreadcrumbLink className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
                    <User className="h-4 w-4 mr-1" /> My Profile
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900 dark:text-gray-100 font-medium">
                    {user?.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      <Separator />

      <div className="container mx-auto py-8 ">
        <div className="overflow-hidden   bg-secondary">
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
                className={`${getStatusColor(user.status || "unknown")} text-white  text-sm font-bold capitalize`}
              >
                {user?.status}
              </Badge>
            </div>
          </div>

          <CardHeader className="pt-24 pb-4 px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  <div className=" ">
                    <span>{user?.name} | </span>
                    <span className="text-xl text-gray-500 ">{user?.role}</span>
                  </div>
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                  Task Management Dashboard
                </CardDescription>
                <div className="text-gray-600 flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Member Since : {formatDate(user.createdAt)}</span>
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

          <CardContent className="space-y-8 p-8">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium">
                      {user.phoneNumber || "No phone number provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md px-6 py-2 transition-all"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md px-6 py-2 transition-all"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Tasks */}
                  <div className="flex flex-col items-start p-6 bg-indigo-100 dark:bg-indigo-500/5 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-200 dark:bg-indigo-800 p-3 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Total Tasks
                      </h3>
                    </div>
                    <span className="text-4xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-2">
                      {getTotalTasks()}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total assigned tasks
                    </p>
                  </div>

                  {/* Completed Tasks */}
                  <div className="flex flex-col items-start p-6 bg-green-100 dark:bg-green-500/5 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-200 dark:bg-green-800 p-3 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Completed
                      </h3>
                    </div>
                    <span className="text-4xl font-extrabold text-green-700 dark:text-green-300 mt-2">
                      {getCompletedTasks()}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Tasks completed
                    </p>
                  </div>

                  {/* Pending Tasks */}
                  <div className="flex flex-col items-start p-6 bg-yellow-100 dark:bg-yellow-500/5 rounded-lg shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-200 dark:bg-yellow-800 p-3 rounded-lg">
                        <Clock3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Pending
                      </h3>
                    </div>
                    <span className="text-4xl font-extrabold text-yellow-700 dark:text-yellow-300 mt-2">
                      {getPendingTasks()}
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Tasks in progress
                    </p>
                  </div>
                </div>

                {/* Task Distribution Chart */}
                <div className="p-6 ">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-6 w-6 text-indigo-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Task Distribution
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
                <div className=" overflow-hidden">
                  {/* Header Section */}
                  <div className="flex items-center px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    <ListChecks className="h-6 w-6 text-indigo-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Recent Tasks
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
