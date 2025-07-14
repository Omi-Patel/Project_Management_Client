"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "@/lib/actions";
import { toast } from "sonner";
import { STORAGE_KEYS } from "@/lib/auth";
import { Send, Loader2 } from "lucide-react";

interface CommentFormProps {
  taskId: string;
  currentUserName: string;
  onCommentAdded: () => void;
}

export function CommentForm({ taskId, currentUserName, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();
  const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error("User not authenticated");
      return createComment({ taskId, content }, currentUserId);
    },
    onSuccess: () => {
      toast.success("Comment added successfully");
      setContent("");
      onCommentAdded();
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      queryClient.invalidateQueries({ queryKey: ["commentCount", taskId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (content.length > 1000) {
      toast.error("Comment is too long (max 1000 characters)");
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-800 p-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage
            src={`https://api.dicebear.com/5.x/initials/svg?seed=${currentUserName}`}
            alt={currentUserName}
          />
          <AvatarFallback className="text-xs">
            {currentUserName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
            maxLength={1000}
            disabled={createMutation.isPending}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {content.length}/1000 characters
            </span>
            
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending || !content.trim()}
              className="flex items-center gap-1"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  Add Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
} 