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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
  getAllUsers,
} from "@/lib/actions";
import { ProjectSchema } from "@/schemas/project-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  ClockIcon,
  FolderKanbanIcon,
  MoreVertical,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { UserResponse } from "@/schemas/user-schema";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/admin-portal/projects/")({
  component: RouteComponent,
  loader: async () => {
    const projects = await getAllProjects("");
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

  // Add users query
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      return await getAllUsers({ page: 1, size: 1000 });
    },
  });

  // Create a map of user IDs to user information
  const userMap =
    users?.reduce(
      (acc, user) => {
        acc[user.id] = user;
        return acc;
      },
      {} as Record<string, UserResponse>
    ) || {};

  const userId = localStorage.getItem("pms-userId");

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
      navigate({ to: "/app/admin-portal/projects", replace: true });
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
      navigate({ to: "/app/admin-portal/projects", replace: true });
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
      navigate({ to: "/app/admin-portal/projects", replace: true });
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

  // Calculate statistics
  const totalProjects = projects.length;
  const overdueProjects = projects.filter((p) => {
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    const today = new Date();
    return endDate < today;
  }).length;

  const dueSoonProjects = projects.filter((p) => {
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const uniqueUsers = new Set(projects.map((p) => p.userId)).size;

  return (
    <SidebarInset>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Admin Portal
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    All Projects
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

      {/* Admin Hero Section */}
      <div className="px-6 py-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b">
        <div className="max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Admin Project Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Comprehensive overview of all projects across the platform. Monitor
            progress, manage resources, and ensure project success.
          </p>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FolderKanbanIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {totalProjects}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Projects
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {uniqueUsers}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {dueSoonProjects}
                  </p>
                  <p className="text-sm text-muted-foreground">Due This Week</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {overdueProjects}
                  </p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              All Projects
            </h2>
            {projects.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {overdueProjects} overdue • {dueSoonProjects} due this week
              </div>
            )}
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`flex flex-col justify-between border shadow-lg rounded-xl overflow-hidden h-full bg-secondary hover:shadow-2xl transition-shadow duration-300 cursor-pointer group`}
                onClick={() => navigate({ to: `/app/projects/${project.id}` })}
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
                            <span className="sr-only">Project Actions</span>
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
                          <span className="text-xs text-primary">Start</span>
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

                    {/* User ID Badge for Admin */}
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Owner :
                        </span>
                        <Badge variant="outline" className="text-xs px-2 py-1 rounded-full text-foreground">
                          {userMap[project.userId]?.name || "Unknown User"}
                        </Badge>
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
              No projects found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              No projects have been created yet. As an admin, you can create
              projects or wait for users to create their own.
            </p>
            <Button onClick={handleAddClick} size="lg" className="shadow-sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create First Project
            </Button>
          </div>
        )}
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
                ? "Update the project details below."
                : "Fill in the details to create a new project as an admin."}
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
                        Choose a color to identify the project
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
              ? This action cannot be undone and will affect the project owner.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
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
