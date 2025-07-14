"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCommentCount } from "@/lib/actions";
import { CommentList } from "./comment-list";
import { CommentForm } from "./comment-form";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/auth";
import { getUserById } from "@/lib/actions";

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [commentCount, setCommentCount] = useState(0);
  console.log("commentCount", commentCount);
  const currentUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);

  // Get current user info
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", currentUserId],
    queryFn: () => (currentUserId ? getUserById(currentUserId) : null),
    enabled: !!currentUserId,
  });

  // Get comment count
  const { data: count = 0 } = useQuery({
    queryKey: ["commentCount", taskId],
    queryFn: () => getCommentCount(taskId),
    staleTime: 30 * 1000, // 30 seconds
  });

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
  };

  const handleCommentUpdated = () => {
    // Refetch comment count when comments are updated
    // The query will automatically refetch
  };

  // Debug info
  console.log("TaskComments Debug:", {
    currentUserId,
    currentUser,
    isUserLoading,
    userError,
    taskId,
    hasUserId: !!currentUserId,
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Comments</h3>
          <Badge variant="secondary" className="ml-2">
            {count}
          </Badge>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <CommentList taskId={taskId} onCommentUpdated={handleCommentUpdated} />
      </div>

      {/* Comment Form - Always show if user is logged in */}
      {currentUserId ? (
        <div className="flex-shrink-0">
          <CommentForm
            taskId={taskId}
            currentUserName={currentUser?.name || "User"}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      ) : (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          Please log in to add comments
        </div>
      )}
    </div>
  );
}
