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
      return "bg-red-100 border-red-300";
    } else if (calendarDay.getTime() === today.getTime()) {
      return "bg-amber-100 border-amber-300";
    } else {
      return "bg-emerald-100 border-emerald-300";
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

      <div className="w-full">
        <Tabs
          defaultValue="card"
          value={activeView}
          onValueChange={setActiveView}
          className="w-full"
        >
          <div className="flex justify-end items-center mb-4 px-4">
            <TabsList>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <LayoutGridIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="card" className="mt-0">
            <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.length > 0 ? (
                projects.map((project) => (
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
          </TabsContent>

          <TabsContent value="calendar" className="mt-0">
            <div className="p-2 sm:p-4">
              <div className=" overflow-hidden">
                {/* Calendar Header */}
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {new Date(currentYear, currentMonth).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </h2>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center font-medium text-sm py-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-1 md:gap-2">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={`
            min-h-[80px] md:min-h-[100px] 
            border rounded-lg 
            p-1 md:p-2 
            transition-colors duration-200
            hover:border-blue-300 dark:hover:border-blue-700
            ${day ? getDayStatus(day) : "bg-gray-50 dark:bg-gray-800"} 
            ${isToday(day) ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""}
          `}
                      >
                        {day && (
                          <>
                            <div className="text-right text-xs md:text-sm font-medium mb-1">
                              {day.getDate()}
                            </div>
                            <div className="space-y-1">
                              {getProjectsForDay(day)
                                .slice(0, 1)
                                .map((project) => (
                                  <div
                                    key={project.id}
                                    className="text-xs p-1 rounded cursor-pointer truncate text-black font-bold hover:opacity-100 transition-opacity"
                                    style={{
                                      backgroundColor: project.color,
                                      opacity: 0.8,
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

                              {getProjectsForDay(day).length >= 2 && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 font-medium w-full text-left transition-colors">
                                      +{getProjectsForDay(day).length - 1} more
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2 space-y-1 z-50">
                                    {getProjectsForDay(day).map((project) => (
                                      <div
                                        key={project.id}
                                        className="text-xs p-2 rounded cursor-pointer truncate text-black font-bold hover:opacity-100 transition-opacity"
                                        style={{
                                          backgroundColor: project.color,
                                          opacity: 0.8,
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
                <div className="p-4 border-t flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-200 border border-red-200 mr-2"></div>
                    <span className="text-xs">Overdue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-200 mr-2"></div>
                    <span className="text-xs">Due Today</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-200 mr-2"></div>
                    <span className="text-xs">Upcoming</span>
                  </div>
                </div>
              </div>

              {projects.length === 0 && (
                <div className="text-center py-8">
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
          </TabsContent>
        </Tabs>
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : "Save"}
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
