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
import { Input } from "@/components/ui/input";
import { deleteWorkspace } from "@/lib/workspace-actions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteWorkspaceDialogProps {
  workspace: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function DeleteWorkspaceDialog({ 
  workspace, 
  open, 
  onOpenChange, 
  userId 
}: DeleteWorkspaceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (confirmText !== workspace.name) {
      toast.error("Please enter the workspace name to confirm deletion");
      return;
    }

    try {
      setIsLoading(true);
      await deleteWorkspace(workspace.id, userId);
      toast.success("Workspace deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      onOpenChange(false);
      setConfirmText("");
    } catch (error) {
      toast.error("Failed to delete workspace");
      console.error("Error deleting workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Delete Workspace</span>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the workspace{" "}
            <strong>{workspace?.name}</strong> and all its projects and data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Warning</p>
                <p>
                  Deleting this workspace will remove all projects, tasks, and member access.
                  This action is irreversible.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Type <strong>{workspace?.name}</strong> to confirm deletion:
            </label>
            <Input
              placeholder="Enter workspace name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
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
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || confirmText !== workspace?.name}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isLoading ? "Deleting..." : "Delete Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 