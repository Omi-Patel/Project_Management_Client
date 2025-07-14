import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getWorkspace,
  getWorkspaceMembers,
  updateMemberRole,
  removeMember,
} from "@/lib/workspace-actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Users,
  FolderOpen,
  Settings,
  Calendar,
  FolderKanbanIcon,
  Sparkles,
  Trash2Icon,
  LayoutGridIcon,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import {
  useNavigate,
  useParams,
  createFileRoute,
} from "@tanstack/react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { WorkspaceSettingsDialog } from "@/components/workspace/workspace-settings-dialog";
import { CreateProjectDialog } from "@/components/Project_Task/create-project-dialog";
import { EditProjectDialog } from "@/components/Project_Task/edit-project-dialog";
import { ProjectCard } from "@/components/Project_Task/project-card";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getWorkspaceProjects } from "@/lib/workspace-actions";
import { updateProject, deleteProject } from "@/lib/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/app/workspace/$workspaceId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceId } = useParams({ from: "/app/workspace/$workspaceId" });
  const navigate = useNavigate();
  const userId = localStorage.getItem("pms-userId") || "";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const queryClient = useQueryClient();
  const [updateRoleLoadingId, setUpdateRoleLoadingId] = useState<string | null>(
    null
  );
  const [activeView, setActiveView] = useState("card");
  const [memberToDelete, setMemberToDelete] = useState<any>(null);
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);

  // Project mutations - must be called before any conditional returns
  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
      toast.success("Project updated successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["workspace-projects"] });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete project");
    },
  });

  const { data: workspace, isLoading: workspaceLoading } = useQuery({
    queryKey: ["workspace", workspaceId, userId],
    queryFn: () => getWorkspace(workspaceId, userId),
    enabled: !!workspaceId && !!userId,
  });

  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["workspace-members", workspaceId, userId],
    queryFn: () => getWorkspaceMembers(workspaceId, userId),
    enabled: !!workspaceId && !!userId,
  });

  const { data: workspaceProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["workspace-projects", workspaceId, userId],
    queryFn: () => getWorkspaceProjects(workspaceId, userId),
    enabled: !!workspaceId && !!userId,
  });

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Please log in to view workspace</p>
        </div>
      </div>
    );
  }

  if (workspaceLoading || membersLoading || projectsLoading) {
    return <LoadingScreen />;
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Workspace not found</p>
        </div>
      </div>
    );
  }

  const isOwner = workspace.ownerId === userId;

  const handleEditProject = (project: any) => {
    setProjectToEdit(project);
    setEditDialogOpen(true);
  };

  const handleDeleteProject = (project: any) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete?.id) {
      deleteMutation.mutate(projectToDelete.id);
    }
  };

  const handleDeleteMember = (member: any) => {
    setMemberToDelete(member);
    setDeleteMemberDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (memberToDelete) {
      try {
        await removeMember(workspaceId, memberToDelete.userId, userId);
        await queryClient.invalidateQueries({
          queryKey: ["workspace-members", workspaceId, userId],
        });
        toast.success("Member removed successfully");
        setDeleteMemberDialogOpen(false);
        setMemberToDelete(null);
      } catch (error) {
        toast.error("Failed to remove member");
        console.error("Error removing member:", error);
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "text-red-600";
      case "ADMIN":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  // Calendar helper functions
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays: (Date | null)[] = [];

  // Add empty days for the first week
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(new Date(currentYear, currentMonth, i));
  }

  // Get projects for a specific day
  const getProjectsForDay = (day: any) => {
    if (!day || !workspaceProjects) return [];

    return workspaceProjects.filter((project) => {
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
    <SidebarInset className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />

            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:flex cursor-pointer items-center">
                  <BreadcrumbLink
                    onClick={() => navigate({ to: "/app/dashboard" })}
                    className="flex items-center "
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:flex cursor-pointer items-center">
                  <BreadcrumbLink
                    onClick={() => navigate({ to: "/app/workspaces" })}
                    className="flex items-center "
                  >
                    Workspaces
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {workspace.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => setSettingsOpen(true)}
                className="shadow-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {workspace.name}
            </h1>
          </div>
          {workspace.description && (
            <p className="text-muted-foreground text-lg leading-relaxed">
              {workspace.description}
            </p>
          )}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">
                {workspace.memberCount} members
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">
                {workspaceProjects?.length || 0} projects
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">
                Created {format(workspace.createdAt, "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        <Tabs defaultValue="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid w-fit grid-cols-2 bg-muted/50">
              <TabsTrigger
                value="projects"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Workspace Projects
                </h2>
                <p className="text-muted-foreground">
                  Manage and collaborate on projects within this workspace
                </p>
              </div>
              <CreateProjectDialog workspaceId={workspaceId} userId={userId} />
            </div>

            <Tabs
              defaultValue="card"
              value={activeView}
              onValueChange={setActiveView}
              className="w-full"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {workspaceProjects?.length || 0}{" "}
                    {(workspaceProjects?.length || 0) === 1
                      ? "Project"
                      : "Projects"}
                  </h3>
                  {workspaceProjects && workspaceProjects.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {
                        workspaceProjects.filter((p) => {
                          if (!p.endDate) return false;
                          const endDate = new Date(p.endDate);
                          const today = new Date();
                          return endDate < today;
                        }).length
                      }{" "}
                      overdue •{" "}
                      {
                        workspaceProjects.filter((p) => {
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
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Loading projects...
                      </p>
                    </div>
                  </div>
                ) : (workspaceProjects?.length || 0) === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-muted/50 rounded-full mb-4">
                      <FolderKanbanIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No projects yet
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Get started by creating your first project. Organize your
                      work and track progress all in one place.
                    </p>
                    <CreateProjectDialog
                      workspaceId={workspaceId}
                      userId={userId}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {workspaceProjects?.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() =>
                          navigate({ to: `/app/projects/${project.id}` })
                        }
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        showActions={true}
                        canEdit={project.userId === userId}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">
                        Loading projects...
                      </p>
                    </div>
                  </div>
                ) : (workspaceProjects?.length || 0) === 0 ? (
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
                    <CreateProjectDialog
                      workspaceId={workspaceId}
                      userId={userId}
                    />
                  </div>
                ) : (
                  <div className="bg-background rounded-lg border">
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
                                          backgroundColor:
                                            project.color || "#3b82f6",
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
                                          +{getProjectsForDay(day).length - 2}{" "}
                                          more
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-64 max-h-60 overflow-y-auto p-2 space-y-1 z-50">
                                        {getProjectsForDay(day).map(
                                          (project) => (
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
                                          )
                                        )}
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
                        <span className="text-sm text-muted-foreground">
                          Overdue
                        </span>
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
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Workspace Members
                </h2>
                <p className="text-muted-foreground">
                  Manage team members and their roles in this workspace
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {members?.length || 0} members
              </Badge>
            </div>

            {membersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Loading members...
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Avatar</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      {isOwner && (
                        <TableHead className="w-20">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members?.map((member) => {
                      const canEditRole =
                        (isOwner &&
                          member.role !== "OWNER" &&
                          member.userId !== userId) ||
                        (isOwner && member.role === "MEMBER");
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="text-sm font-medium">
                                {member.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">
                            {member.userName}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {member.userEmail}
                          </TableCell>
                          <TableCell>
                            {canEditRole ? (
                              <RoleSelect
                                value={member.role}
                                disabled={updateRoleLoadingId === member.id}
                                onChange={async (newRole) => {
                                  setUpdateRoleLoadingId(member.id);
                                  try {
                                    await updateMemberRole(
                                      workspaceId,
                                      member.userId,
                                      newRole,
                                      userId
                                    );
                                    await queryClient.invalidateQueries({
                                      queryKey: [
                                        "workspace-members",
                                        workspaceId,
                                        userId,
                                      ],
                                    });
                                    toast.success("Role updated");
                                  } catch (e) {
                                    toast.error("Failed to update role");
                                  } finally {
                                    setUpdateRoleLoadingId(null);
                                  }
                                }}
                              />
                            ) : (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getRoleColor(member.role)}`}
                              >
                                {member.role}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(member.joinedAt, "MMM d, yyyy")}
                          </TableCell>
                          {isOwner && (
                            <TableCell>
                              {member.role !== "OWNER" &&
                                member.userId !== userId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMember(member)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2Icon className="h-4 w-4" />
                                  </Button>
                                )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {workspace && (
        <WorkspaceSettingsDialog
          workspace={workspace}
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          userId={userId}
        />
      )}

      {/* Edit Project Dialog */}
      {projectToEdit && (
        <EditProjectDialog
          project={projectToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          workspaceId={workspaceId}
          onUpdate={async (projectData) => {
            await updateMutation.mutateAsync(projectData);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Member Confirmation Dialog */}
      <Dialog
        open={deleteMemberDialogOpen}
        onOpenChange={setDeleteMemberDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{memberToDelete?.userName}" from
              this workspace? This action cannot be undone and they will lose
              access to all workspace projects.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteMemberDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}) {
  const roles = ["ADMIN", "MEMBER"];
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-28 h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {role.charAt(0) + role.slice(1).toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default RouteComponent;
