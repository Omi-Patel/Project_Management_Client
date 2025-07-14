import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  WorkspaceUpdateSchema,
  WorkspaceMemberSchema,
} from "@/schemas/workspace-schema";
import {
  updateWorkspace,
  inviteUserToWorkspace,
  getWorkspaceMembers,
  // removeMember,
} from "@/lib/workspace-actions";
import { toast } from "sonner";
import { Loader2, Mail, UserPlus, Users, Settings } from "lucide-react";

interface WorkspaceSettingsDialogProps {
  workspace: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function WorkspaceSettingsDialog({
  workspace,
  open,
  onOpenChange,
  userId,
}: WorkspaceSettingsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [members, setMembers] = useState<WorkspaceMemberSchema[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();

  const form = useForm<WorkspaceUpdateSchema>({
    resolver: zodResolver(WorkspaceUpdateSchema),
    defaultValues: {
      name: workspace?.name || "",
      description: workspace?.description || "",
      ownerId: workspace?.ownerId || userId,
    },
  });

  // Load members when dialog opens
  useEffect(() => {
    if (open && workspace?.id) {
      loadMembers();
    }
  }, [open, workspace?.id]);

  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const membersData = await getWorkspaceMembers(workspace.id, userId);
      setMembers(membersData);
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load workspace members");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const onSubmit = async (data: WorkspaceUpdateSchema) => {
    try {
      setIsLoading(true);
      const updateData = {
        ...data,
        ownerId: workspace?.ownerId || userId,
      };
      await updateWorkspace(workspace.id, updateData, userId);
      toast.success("Workspace updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update workspace");
      console.error("Error updating workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setIsInviting(true);
      await inviteUserToWorkspace({
        workspaceId: workspace.id,
        invitedEmail: inviteEmail.trim(),
        invitedBy: userId,
      });
      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      // Reload members to show any changes
      await loadMembers();
    } catch (error) {
      toast.error("Failed to send invitation");
      console.error("Error inviting user:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const isOwner = workspace?.ownerId === userId;
  const isAdmin =
    members.find((m) => m.userId === userId)?.role === "ADMIN" || isOwner;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "MEMBER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workspace Settings
          </DialogTitle>
          <DialogDescription className="text-base">
            Manage your workspace settings and members.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workspace Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter workspace name" {...field} />
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
                          placeholder="Enter workspace description"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !isOwner}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {/* Invite Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                <h3 className="text-lg font-medium">Invite Members</h3>
              </div>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleInviteUser()}
                  disabled={isInviting || !isAdmin}
                />
                <Button
                  onClick={handleInviteUser}
                  disabled={isInviting || !isAdmin || !inviteEmail.trim()}
                  className="flex items-center gap-2"
                >
                  {isInviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {isInviting ? "Sending..." : "Invite"}
                </Button>
              </div>

              {!isAdmin && (
                <p className="text-sm text-muted-foreground">
                  Only workspace owners and admins can invite new members.
                </p>
              )}
            </div>

            <Separator />

            {/* Members List */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <h3 className="text-lg font-medium">Current Members</h3>
              </div>

              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading members...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No members found.
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(member.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {member.userName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>

                        {/* {isOwner && member.role !== "OWNER" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.userId, member.userName)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )} */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
