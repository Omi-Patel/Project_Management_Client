import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWorkspacesForUser } from "@/lib/workspace-actions";
import { WorkspaceResponseSchema } from "@/schemas/workspace-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Trash2,
  Search,
  Calendar,
  User,
  Sparkles,
  Plus,
  Building2,
  ArrowRight,
  MoreHorizontal,
  Globe,
  Shield,
  Users2,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { WorkspaceSettingsDialog } from "./workspace-settings-dialog";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { NotificationSidebar } from "./notification-sidebar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkspaceListProps {
  userId: string;
}

export function WorkspaceList({ userId }: WorkspaceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceResponseSchema | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: workspaces,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspaces", userId, searchQuery],
    queryFn: () => getWorkspacesForUser(userId, searchQuery || undefined),
  });

  const handleWorkspaceClick = (workspace: WorkspaceResponseSchema) => {
    navigate({ to: `/app/workspace/${workspace.id}` });
  };

  const handleSettingsClick = (workspace: WorkspaceResponseSchema) => {
    setSelectedWorkspace(workspace);
    setSettingsOpen(true);
  };

  const handleDeleteClick = (workspace: WorkspaceResponseSchema) => {
    setSelectedWorkspace(workspace);
    setDeleteOpen(true);
  };

  const isOwner = (workspace: WorkspaceResponseSchema) =>
    workspace.ownerId === userId;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600">Failed to load workspaces</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    Workspaces
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationSidebar
              userId={userId}
              userEmail={localStorage.getItem("pms-email") || ""}
            />
            <CreateWorkspaceDialog userId={userId} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-6 py-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-b">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
          </div>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Manage your workspaces and collaborate with your team
          </p>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">
                {workspaces?.length || 0} workspaces
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">
                {workspaces?.reduce(
                  (total, ws) => total + (ws.projectCount || 0),
                  0
                ) || 0}{" "}
                total projects
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Workspaces Grid */}
          {workspaces?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-muted/50 rounded-full mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No workspaces found
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Create your first workspace to get started."}
              </p>
              {!searchQuery && <CreateWorkspaceDialog userId={userId} />}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {workspaces?.map((workspace) => (
                <div
                  key={workspace.id}
                  className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleWorkspaceClick(workspace)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Top Section */}
                  <div className="relative z-10 flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {workspace.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          {isOwner(workspace) ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 text-xs px-2 py-0.5">
                              <Shield className="h-3 w-3 mr-1" />
                              Owner
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5">
                              <Users2 className="h-3 w-3 mr-1" />
                              Member
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {isOwner(workspace) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 "
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleSettingsClick(workspace);
                          }}>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(workspace);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Workspace
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Description */}
                  <div className="relative z-10 mb-2 h-12 ">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                      {workspace.description || "No description available"}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="relative z-10 flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-md mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-sm">
                        <Users className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {workspace.memberCount}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-sm">
                        <FolderOpen className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {workspace.projectCount || 0}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">projects</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-sm">
                        <Activity className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Active</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>Created {format(workspace.createdAt, "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                      <span>Open</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-purple-200 dark:group-hover:border-purple-700 rounded-xl transition-colors duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedWorkspace && (
        <>
          <WorkspaceSettingsDialog
            workspace={selectedWorkspace}
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            userId={userId}
          />
          <DeleteWorkspaceDialog
            workspace={selectedWorkspace}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            userId={userId}
          />
        </>
      )}
    </div>
  );
}
