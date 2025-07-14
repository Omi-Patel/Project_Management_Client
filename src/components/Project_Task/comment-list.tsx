"use client";

import { useQuery } from "@tanstack/react-query";
import { getCommentsForTask } from "@/lib/actions";
import { CommentItem } from "./comment-item";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, AlertCircle } from "lucide-react";
import type { ListCommentsRequest } from "@/schemas/comment-schema";
import { useEffect, useRef } from "react";

interface CommentListProps {
  taskId: string;
  onCommentUpdated: () => void;
}

export function CommentList({ taskId, onCommentUpdated }: CommentListProps) {
  const request: ListCommentsRequest = {
    taskId,
    page: 1,
    size: 50, // Load more comments at once
  };

  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => getCommentsForTask(request),
    staleTime: 30 * 1000, // 30 seconds
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when comments change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments.length]);

  const handleCommentUpdated = () => {
    onCommentUpdated();
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load comments</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the comments. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
        <p className="text-muted-foreground">
          Be the first to add a comment to this task.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-0 h-full overflow-y-auto">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onCommentUpdated={handleCommentUpdated}
        />
      ))}
    </div>
  );
} 