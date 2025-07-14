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
  Building2,
  FolderKanban,
  Users,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Crown,
  Shield,
  Info,
} from "lucide-react";
import { getAllWorkspaces, getWorkspaceProjectsForAdmin, getWorkspaceMembersForAdmin } from "@/lib/workspace-actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/app/admin-portal/workspaces/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch all workspaces
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery({
    queryKey: ["admin-workspaces"],
    queryFn: () => getAllWorkspaces(),
  });

  // Filter workspaces based on search term
  const filteredWorkspaces = workspaces?.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const toggleWorkspaceExpansion = (workspaceId: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceId)) {
      newExpanded.delete(workspaceId);
    } else {
      newExpanded.add(workspaceId);
    }
    setExpandedWorkspaces(newExpanded);
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <SidebarInset>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center gap-4 px-6">
          <div className="flex items-center gap-4">
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
                    All Workspaces
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

            {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8 text-white shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">All Workspaces</h1>
                      <p className="text-white/70">
                        Manage and monitor all workspaces in the system
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{workspaces?.length || 0}</div>
                    <div className="text-sm text-white/70">Total Workspaces</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {workspaces?.reduce((sum, ws) => sum + (ws.projectCount || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-white/70">Total Projects</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
            <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
          </div>

          {/* Search Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-4 sm:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Workspaces</h3>
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              {isLoadingWorkspaces ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                workspaces?.length || 0
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-4 sm:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Projects</h3>
              <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              {isLoadingWorkspaces ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                workspaces?.reduce((sum, ws) => sum + (ws.projectCount || 0), 0) || 0
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-4 sm:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Members</h3>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              {isLoadingWorkspaces ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                workspaces?.reduce((sum, ws) => sum + (ws.memberCount || 0), 0) || 0
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-4 sm:p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Active Workspaces</h3>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            </div>
            <div className="text-lg sm:text-2xl font-bold">
              {isLoadingWorkspaces ? (
                <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
              ) : (
                workspaces?.filter(ws => (ws.projectCount || 0) > 0).length || 0
              )}
            </div>
          </div>
        </div>

        {/* Workspaces List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Workspace Details</h2>
          
          {isLoadingWorkspaces ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-background border rounded-lg p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredWorkspaces.length === 0 ? (
            <div className="bg-background border rounded-lg p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No workspaces found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "No workspaces match your search criteria." : "No workspaces have been created yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkspaces.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  isExpanded={expandedWorkspaces.has(workspace.id)}
                  onToggleExpansion={() => toggleWorkspaceExpansion(workspace.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </main>
    </SidebarInset>
  );
}

interface WorkspaceCardProps {
  workspace: any;
  isExpanded: boolean;
  onToggleExpansion: () => void;
}

function WorkspaceCard({ workspace, isExpanded, onToggleExpansion }: WorkspaceCardProps) {
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["workspace-projects", workspace.id],
    queryFn: () => getWorkspaceProjectsForAdmin(workspace.id),
    enabled: isExpanded,
  });

  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["workspace-members", workspace.id],
    queryFn: () => getWorkspaceMembersForAdmin(workspace.id),
    enabled: isExpanded,
  });

  return (
    <div className="bg-background border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Mobile Design */}
      <div className="sm:hidden">
        <div className="p-4">
          {/* Header with icon and expand button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold truncate">{workspace.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(workspace.createdAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {workspace.memberCount || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <FolderKanban className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {workspace.projectCount || 0}
                </span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {workspace.projectCount > 0 ? 'Active' : 'Empty'}
            </div>
          </div>

          {/* Description */}
          {workspace.description && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {workspace.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Design */}
      <div className="hidden sm:block p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate mb-1">{workspace.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Created {formatDistanceToNow(workspace.createdAt, { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{workspace.memberCount || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <FolderKanban className="h-4 w-4" />
                <span>{workspace.projectCount || 0} projects</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {workspace.description && (
          <div className="mt-4 bg-muted/30 rounded-lg p-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground w-full">
              {workspace.description}
            </p>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t p-4 sm:p-6">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="projects" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Projects ({projects?.length || 0})</span>
                <span className="sm:hidden">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="members" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Members ({members?.length || 0})</span>
                <span className="sm:hidden">Members</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="mt-4">
              {isLoadingProjects ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  ))}
                </div>
              ) : projects && projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project: any) => (
                    <div key={project.id} className="bg-background border rounded-lg p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-base truncate">{project.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Status:</span>
                        <Badge variant="secondary" className="text-xs">{project.status || "ACTIVE"}</Badge>
                        <span className="ml-auto flex items-center gap-1">
                          <span className="inline-block w-4 h-4 rounded-full border border-muted" style={{ backgroundColor: project.color || "#6366f1" }} />
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {project.description || "No description"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No projects in this workspace</p>
                  <p className="text-xs mt-1">Projects will appear here when created</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="members" className="mt-4">
              {isLoadingMembers ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members && members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member: any) => (
                    <div key={member.id} className="bg-background border rounded-lg p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-base truncate">{member.userName}</span>
                        <Badge 
                          variant={member.role === "OWNER" ? "default" : member.role === "ADMIN" ? "secondary" : "outline"} 
                          className="text-xs ml-auto"
                        >
                          {member.role === "OWNER" && <Crown className="h-3 w-3 mr-1" />}
                          {member.role === "ADMIN" && <Shield className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{member.userEmail}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined {formatDistanceToNow(member.joinedAt, { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No members in this workspace</p>
                  <p className="text-xs mt-1">Members will appear here when they join</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 