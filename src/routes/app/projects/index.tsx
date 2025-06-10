"use client";

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
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
} from "@/lib/actions";
import {
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  MoreVertical,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { LoadingScreen } from "@/components/LoadingScreen";
import { ProjectSchema } from "@/schemas/project-schema";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORAGE_KEYS } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/app/projects/")({
  component: RouteComponent,
  loader: async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (!userId) {
      throw new Error("User ID is not available in localStorage");
    }
    const projects = await getAllProjects(userId);
    return projects as ProjectSchema[];
  },
  pendingComponent: () => {
    return <LoadingScreen />;
  },
});

function RouteComponent() {
  const projects = Route.useLoaderData();

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectSchema | null>(
    null
  );
  const [projectToDelete, setProjectToDelete] = useState<ProjectSchema | null>(
    null
  );
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();

  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  const form = useForm<ProjectSchema>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      id: selectedProject?.id,
      name: selectedProject?.name || "",
      description: selectedProject?.description || "",
      userId: selectedProject?.userId || userId || "",
      startDate: selectedProject?.startDate
        ? new Date(selectedProject.startDate).getTime().toString()
        : null,
      endDate: selectedProject?.endDate
        ? new Date(selectedProject.endDate).getTime().toString()
        : null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projects", replace: true });
      setOpen(false);
      toast.success("Project created successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create project. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projects", replace: true });
      setOpen(false);
      toast.success("Project updated successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update project. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projects", replace: true });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete project. Please try again.");
    },
  });

  const onSubmit = (data: ProjectSchema) => {
    if (!userId) {
      toast.error("User ID is missing. Please log in again.");
      return;
    }

    const projectData = {
      ...data,
      userId, // Ensure userId is included
    };

    if (data.id) {
      updateMutation.mutate(projectData);
    } else {
      createMutation.mutate(projectData);
    }
  };

  const handleAddClick = () => {
    setSelectedProject(null);
    form.reset({
      id: null,
      name: "",
      description: "",
      userId: userId ?? undefined,
      color: "#3b82f6",
      startDate: null,
      endDate: null,
    });
    setOpen(true);
  };

  const handleEditClick = (project: ProjectSchema) => {
    setSelectedProject(project);
    form.reset({
      id: project.id,
      name: project.name || "",
      description: project.description || "",
      userId: project.userId || userId || "",
      startDate: project.startDate
        ? new Date(project.startDate).getTime().toString()
        : null,
      endDate: project.endDate
        ? new Date(project.endDate).getTime().toString()
        : null,
      color: project.color || "#3b82f6",
    });
    setOpen(true);
  };

  const handleDeleteClick = (project: ProjectSchema) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete?.id) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  const [activeView, setActiveView] = useState("card");

  // Calendar view helpers
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create calendar days array
  const calendarDays = [];

  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentYear, currentMonth, i));
  }

  // Get projects for a specific day
  const getProjectsForDay = (day: any) => {
    if (!day) return [];

    return projects.filter((project) => {
      if (!project.endDate) return false;

      const endDate = new Date(project.endDate);
      endDate.setHours(0, 0, 0, 0);

      const calendarDay = new Date(day);
      calendarDay.setHours(0, 0, 0, 0);

      return endDate.getTime() === calendarDay.getTime();
    });
  };

  // Get day status based on projects
  const getDayStatus = (day: any) => {
    if (!day) return "";

    const dayProjects = getProjectsForDay(day);
    if (dayProjects.length === 0) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarDay = new Date(day);
    calendarDay.setHours(0, 0, 0, 0);

    if (calendarDay.getTime() < today.getTime()) {
      return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800";
    } else if (calendarDay.getTime() === today.getTime()) {
      return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800";
    } else {
      return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800";
    }
  };

  // Check if a day is today
  const isToday = (day: any) => {
    if (!day) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarDay = new Date(day);
    calendarDay.setHours(0, 0, 0, 0);

    return today.getTime() === calendarDay.getTime();
  };

  return (
    <SidebarInset>
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
                    Projects Overview
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto">
            <Button
              onClick={handleAddClick}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <PlusIcon className="size-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Project Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Manage your projects with ease. Switch between{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Card View
            </span>{" "}
            for detailed project cards or{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Calendar View
            </span>{" "}
            to track deadlines and milestones.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <Tabs
          defaultValue="card"
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {projects.length}{" "}
                {projects.length === 1 ? "Project" : "Projects"}
              </h2>
              {projects.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {
                    projects.filter((p) => {
                      if (!p.endDate) return false;
                      const endDate = new Date(p.endDate);
                      const today = new Date();
                      return endDate < today;
                    }).length
                  }{" "}
                  overdue •{" "}
                  {
                    projects.filter((p) => {
                      if (!p.endDate) return false;
                      const endDate = new Date(p.endDate);
                      const today = new Date();
                      const diffTime = endDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );
                      return diffDays >= 0 && diffDays <= 7;
                    }).length
                  }{" "}
                  due this week
                </div>
              )}
            </div>
            <TabsList className="grid w-fit grid-cols-2 bg-muted/50">
              <TabsTrigger
                value="card"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <LayoutGridIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="card" className="mt-6">
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`flex flex-col justify-between border shadow-lg rounded-xl overflow-hidden h-full bg-secondary hover:shadow-2xl transition-shadow duration-300 cursor-pointer group`}
                    onClick={() =>
                      navigate({ to: `/app/projects/${project.id}` })
                    }
                  >
                    <div className="">
                      {/* Top Section: Status Badge and Actions Dropdown */}
                      <div className="flex justify-between items-center px-4 py-1 ">
                        <div>
                          {/* Left side - Badge */}
                          {project.startDate && project.endDate && (
                            <div>
                              <span
                                className={`inline-flex justify-center items-center px-2.5 py-1 rounded-full text-xs font-medium ${(() => {
                                  const endDate = new Date(project.endDate);
                                  endDate.setHours(0, 0, 0, 0);

                                  const startDate = new Date(project.startDate);
                                  startDate.setHours(0, 0, 0, 0);

                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);

                                  const daysRemaining = Math.ceil(
                                    (endDate.getTime() - today.getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  );

                                  return daysRemaining < 0
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : daysRemaining <= 3
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : daysRemaining <= 7
                                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                                        : "bg-emerald-100 text-emerald-800 border border-emerald-200";
                                })()}`}
                              >
                                {(() => {
                                  const endDate = new Date(project.endDate);
                                  endDate.setHours(0, 0, 0, 0);

                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);

                                  const daysRemaining = Math.ceil(
                                    (endDate.getTime() - today.getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  );

                                  return daysRemaining < 0
                                    ? `${Math.abs(daysRemaining)} days overdue`
                                    : daysRemaining === 0
                                      ? "Due today!"
                                      : daysRemaining === 1
                                        ? "Due tomorrow"
                                        : `${daysRemaining} days remaining`;
                                })()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          {/* Right side - Actions */}
                          {project.userId === userId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                className=" "
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className=" rounded-full w-8 h-8 hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                  <MoreVertical className="h-4 w-4 text-primary " />
                                  <span className="sr-only">
                                    Project Actions
                                  </span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem
                                  onSelect={() => handleEditClick(project)}
                                >
                                  <PencilIcon className="mr-2 h-4 w-4" />
                                  <span>Edit Project</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600 "
                                  onSelect={() => handleDeleteClick(project)}
                                >
                                  <Trash2Icon className="mr-2 h-4 w-4" />
                                  <span>Delete Project</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      {/* Project Details */}
                      <CardHeader
                        className="pt-2 pb-6 px-6"
                        style={{ borderLeft: `3px solid ${project.color}` }}
                      >
                        <div className="flex items-center mb-3">
                          <div className="flex items-center justify-center size-9 rounded-lg mr-3 shrink-0">
                            <FolderKanbanIcon
                              className="size-5"
                              style={{ color: project.color }}
                            />
                          </div>
                          <CardTitle className="text-xl font-semibold text-primary leading-tight">
                            {project.name}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                          {project.description || "No description available."}
                        </CardDescription>
                        {/* Metadata Section */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarDaysIcon className="size-4 mr-2 text-gray-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs text-primary">
                                Start
                              </span>
                              <span className="font-medium text-primary">
                                {formatDate(project.startDate)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="size-4 mr-2 text-gray-500 shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-xs text-primary">End</span>
                              <span className="font-medium text-primary">
                                {formatDate(project.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </div>

                    {/* Card Footer - Meta Info */}
                    <CardFooter
                      className="flex justify-start items-center p-4 bg-gray-50"
                      style={{
                        backgroundColor: `${project.color}`,
                      }}
                    >
                      <span className="text-xs text-black font-semibold">
                        Created On : {formatDate(project.createdAt)}
                      </span>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <FolderKanbanIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Get started by creating your first project. Organize your work
                  and track progress all in one place.
                </p>
                <Button
                  onClick={handleAddClick}
                  size="lg"
                  className="shadow-sm"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              {/* Calendar Header */}
              <div className="p-6 border-b bg-muted/30">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {new Date(currentYear, currentMonth).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {projects.filter((p) => p.endDate).length} projects with
                    deadlines
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-semibold text-sm py-3 text-muted-foreground"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`
                        min-h-[100px] lg:min-h-[120px]
                        border rounded-lg 
                        p-2 lg:p-3
                        transition-all duration-200
                        hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm
                        ${day ? getDayStatus(day) : "bg-muted/30 border-muted"} 
                        ${isToday(day) ? "ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-2" : ""}
                      `}
                    >
                      {day && (
                        <>
                          <div className="text-right text-sm font-semibold mb-2 text-foreground">
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {getProjectsForDay(day)
                              .slice(0, 2)
                              .map((project) => (
                                <div
                                  key={project.id}
                                  className="text-xs p-1.5 rounded-md cursor-pointer truncate text-white font-medium hover:scale-105 transition-transform shadow-sm"
                                  style={{
                                    backgroundColor: project.color || "#3b82f6",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate({
                                      to: `/app/projects/${project.id}`,
                                    });
                                  }}
                                >
                                  {project.name}
                                </div>
                              ))}

                            {getProjectsForDay(day).length > 2 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 font-medium w-full text-left transition-colors p-1 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded">
                                    +{getProjectsForDay(day).length - 2} more
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2 space-y-1 z-50">
                                  {getProjectsForDay(day).map((project) => (
                                    <div
                                      key={project.id}
                                      className="text-xs p-2 rounded cursor-pointer truncate text-white font-medium hover:scale-105 transition-transform"
                                      style={{
                                        backgroundColor:
                                          project.color || "#3b82f6",
                                      }}
                                      onClick={() =>
                                        navigate({
                                          to: `/app/projects/${project.id}`,
                                        })
                                      }
                                    >
                                      {project.name}
                                    </div>
                                  ))}
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="px-6 py-4 border-t bg-muted/30 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-200 border border-red-300 dark:bg-red-950/50 dark:border-red-800"></div>
                  <span className="text-sm text-muted-foreground">Overdue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-300 dark:bg-amber-950/50 dark:border-amber-800"></div>
                  <span className="text-sm text-muted-foreground">
                    Due Today
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800"></div>
                  <span className="text-sm text-muted-foreground">
                    Upcoming
                  </span>
                </div>
              </div>

              {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-muted/50 rounded-full mb-4">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No projects to display
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Create projects with deadlines to see them appear on your
                    calendar.
                  </p>
                  <Button onClick={handleAddClick} size="lg">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit Project Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedProject ? "Edit Project" : "Create New Project"}
            </DialogTitle>
            <DialogDescription>
              {selectedProject
                ? "Update your project details below."
                : "Fill in the details to create a new project."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors:", errors);
              })}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a descriptive project name"
                        {...field}
                        value={field.value || ""}
                        autoComplete="off"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this project is about..."
                        {...field}
                        value={field.value || ""}
                        autoComplete="off"
                        className="min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Start Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-10"
                            >
                              <CalendarDaysIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(
                                    new Date(Number(field.value)),
                                    "MMM dd, yyyy"
                                  )
                                : "Select date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? new Date(Number(field.value))
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const epochTime = date.getTime();
                                field.onChange(epochTime.toString());
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        End Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-10"
                            >
                              <ClockIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(
                                    new Date(Number(field.value)),
                                    "MMM dd, yyyy"
                                  )
                                : "Select date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="p-0">
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? new Date(Number(field.value))
                                : undefined
                            }
                            onSelect={(date) => {
                              if (date) {
                                const epochTime = date.getTime();
                                field.onChange(epochTime.toString());
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Project Color
                    </FormLabel>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          value={field.value || "#3b82f6"}
                          className="w-16 h-10 p-1 border rounded-md cursor-pointer"
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        Choose a color to identify your project
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : selectedProject
                      ? "Update Project"
                      : "Create Project"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Project</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{projectToDelete?.name}"
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
