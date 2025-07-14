"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateComment, deleteComment } from "@/lib/actions";
import { toast } from "sonner";
import type { CommentResponse } from "@/schemas/comment-schema";
import { STORAGE_KEYS } from "@/lib/auth";
import { format } from "date-fns";
import { Edit2, Trash2, X, Check } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

interface CommentItemProps {
  comment: CommentResponse;
  onCommentUpdated: () => void;
}

function cleanContent(content: string) {
  if (!content) return "";
  if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
    try {
      return JSON.parse(content);
    } catch {
      return content.slice(1, -1);
    }
  }
  return content;
}

export function CommentItem({ comment, onCommentUpdated }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(cleanContent(comment.content));
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const canModify = currentUserId === comment.userId;

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error("User not authenticated");
      return updateComment(comment.id, editContent, currentUserId);
    },
    onSuccess: () => {
      toast.success("Comment updated successfully");
      setIsEditing(false);
      onCommentUpdated();
      queryClient.invalidateQueries({ queryKey: ["comments", comment.taskId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update comment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error("User not authenticated");
      return deleteComment(comment.id, currentUserId);
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      onCommentUpdated();
      queryClient.invalidateQueries({ queryKey: ["comments", comment.taskId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(cleanContent(comment.content));
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(cleanContent(comment.content));
  };

  const handleSaveEdit = () => {
    if (editContent.trim() === "") {
      toast.error("Comment cannot be empty");
      return;
    }
    updateMutation.mutate();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  const isEdited = comment.createdAt !== comment.updatedAt;

  return (
    <div className="group relative">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" className="border-secondary">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDeleteDialog(false);
                  deleteMutation.mutate();
                }}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Main comment row */}
      <div className="flex gap-1 sm:gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 last:border-b-0 items-start min-w-0">
        <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 ring-2 ring-primary/70 bg-secondary">
          <AvatarImage
            src={`https://api.dicebear.com/5.x/initials/svg?seed=${comment.userName}`}
            alt={comment.userName}
          />
          <AvatarFallback className="text-[10px] font-medium bg-primary text-white">
            {comment.userName.trim().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1 min-w-0 flex-wrap">
            <div className="flex items-center gap-1 min-w-0 flex-wrap">
              <span className="font-semibold text-foreground text-xs truncate">
                {comment.userName}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {formatDate(comment.createdAt)}
                {isEdited && (
                  <span className="ml-1 text-muted-foreground/70 italic">
                    (edited)
                  </span>
                )}
              </span>
            </div>
            {canModify && !isEditing && (
              <div className="flex items-center gap-0.5">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleEdit}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 focus-visible:ring-primary"
                  title="Edit comment"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-destructive disabled:opacity-50"
                  title="Delete comment"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-1">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[36px] resize-none text-xs border-secondary focus:border-primary focus:ring-primary/20"
                maxLength={1000}
              />
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="h-6 px-2 bg-primary hover:bg-primary/90 text-white font-medium transition-colors disabled:opacity-50 text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateMutation.isPending}
                  className="h-6 px-2 border-secondary hover:bg-secondary/40 transition-colors disabled:opacity-50 bg-transparent text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-primary/5 border border-secondary/40 rounded-md px-2 py-1 shadow-sm">
              <p className="text-xs text-foreground whitespace-pre-wrap leading-snug mb-0">
                {cleanContent(comment.content).trim()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
