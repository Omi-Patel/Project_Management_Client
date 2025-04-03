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
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/actions";
import {
  CalendarDaysIcon,
  ClockIcon,
  FolderKanbanIcon,
  MoreVertical,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
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

export const Route = createFileRoute("/app/projects/")({
  component: RouteComponent,
  loader: async () => {
    const userId = localStorage.getItem("userId");
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

  const userId = localStorage.getItem("userId");

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
      color: "#000000",
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
      color: project.color || "#000000",
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

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Projects List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button onClick={handleAddClick} className="cursor-pointer">
            <PlusIcon className="size-3 mr-1" />
            Add Project
          </Button>
        </div>
      </header>
      <Separator className="mb-4" />
      <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No projects available
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start by creating a new project.
            </p>
            <Button onClick={handleAddClick} className="mt-4">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Edit Project" : "Add Project"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors:", errors); // Debug log
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        {...field}
                        value={field.value || ""}
                        autoComplete="off"
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        {...field}
                        value={field.value || ""}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start and End Date Fields in a Single Row */}
              <div className="flex gap-4">
                {/* Start Date Field */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                            >
                              {field.value
                                ? format(
                                    new Date(Number(field.value)),
                                    "yyyy-MM-dd"
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
                                // Convert selected date to epoch time (milliseconds)
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

                {/* End Date Field */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left"
                            >
                              {field.value
                                ? format(
                                    new Date(Number(field.value)),
                                    "yyyy-MM-dd"
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
                                // Convert selected date to epoch time (milliseconds)
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

              {/* Color Field */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Set Color</FormLabel>
                    <FormControl>
                      <Input
                        className="w-18"
                        type="color"
                        {...field}
                        value={field.value || "#000000"} // Default color
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
