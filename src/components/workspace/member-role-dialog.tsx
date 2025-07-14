import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateMemberRole } from "@/lib/workspace-actions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Shield, UserCheck } from "lucide-react";

interface MemberRoleDialogProps {
  workspaceId: string;
  member: any;
  requesterUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberRoleDialog({ 
  workspaceId, 
  member, 
  requesterUserId, 
  open, 
  onOpenChange 
}: MemberRoleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newRole, setNewRole] = useState(member?.role || "MEMBER");
  const queryClient = useQueryClient();

  const handleUpdateRole = async () => {
    try {
      setIsLoading(true);
      await updateMemberRole(workspaceId, member.userId, newRole, requesterUserId);
      toast.success("Member role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspace-members"] });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update member role");
      console.error("Error updating member role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Shield className="h-4 w-4" />;
      case "ADMIN":
        return <UserCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Update Member Role</DialogTitle>
          <DialogDescription className="text-base">
            Change the role for {member?.userName} in this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/30">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-sm font-medium">
                {member?.userName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg">{member?.userName}</span>
                <div className="flex items-center space-x-1">
                  {getRoleIcon(member?.role)}
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getRoleColor(member?.role)}`}
                  >
                    {member?.role}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{member?.userEmail}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Member</span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Member:</strong> Can view and work on projects</p>
            <p><strong>Admin:</strong> Can manage projects and invite members</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={isLoading || newRole === member?.role}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 