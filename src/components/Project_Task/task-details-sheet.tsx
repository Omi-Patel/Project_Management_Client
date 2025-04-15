"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  AlertCircle,
  CalendarClock,
  CalendarIcon,
  CheckCircle2,
  Clock,
  Clock3Icon,
  Flag,
  MessageSquare,
  PencilIcon,
  Tag,
  TrashIcon,
  Users,
} from "lucide-react";
import type { TaskResponse } from "@/schemas/task_schema";
import { getBadgeColor } from "@/lib/task-utils";
import { Separator } from "../ui/separator";

interface User {
  id: string;
  name: string;
}

interface TaskDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskResponse | null;
  assignees: User[];
  onEditClick: (task: TaskResponse) => void;
  onDeleteClick: (task: TaskResponse) => void;
}

export function TaskDetailsSheet({
  isOpen,
  onOpenChange,
  task,
  assignees,
  onEditClick,
  onDeleteClick,
}: TaskDetailsSheetProps) {
  if (!task) return null;

  // Format date with time
  const formatDateTime = (dateString: any) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  // Function to get relative time
  const getRelativeTime = (date: any) => {
    if (!date) return "";

    // This is a placeholder - in a real app you'd use a library like date-fns
    const now = new Date();
    const then = new Date(date);
    const diffInDays = Math.floor(
      (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays === -1) return "Tomorrow";
    if (diffInDays > 0) return `${diffInDays} days ago`;
    return `In ${Math.abs(diffInDays)} days`;
  };

  // Get status icon
  const getStatusIcon = (status: any) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "done":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "in progress":
        return <Clock className="h-3 w-3 mr-1" />;
      case "overdue":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[90%] sm:max-w-md md:max-w-lg p-0 overflow-y-auto">
        <div className="h-full flex flex-col">
          {/* Header with status badge */}
          <div className="p-6 pb-2">
            <SheetHeader className="text-left">
              <SheetTitle className="text-2xl font-bold leading-tight mt-2">
                {task.title}
              </SheetTitle>
            </SheetHeader>
          </div>

          {/* Description */}
          <div className="px-6 py-3">
            <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
              Description
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-24">
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description || "No description available for this task."}
              </p>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Task details */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center">
              <Tag className="h-4 w-4 mr-2 opacity-70" />
              Task Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {/* Status */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <Badge className={`${getBadgeColor(task.status)} text-black`}>
                  {task.status}
                </Badge>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <Badge
                  className={`${getBadgeColor(task.priority)} text-black flex items-center`}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {task.priority}
                </Badge>
              </div>

              {/* Created At */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm font-medium">
                    {formatDateTime(task.createdAt)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {getRelativeTime(task.createdAt)}
                </p>
              </div>

              {/* Updated At */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <div className="flex items-center">
                  <Clock3Icon className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm font-medium">
                    {formatDateTime(task.updatedAt)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {getRelativeTime(task.updatedAt)}
                </p>
              </div>

              {/* Due Date */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Due Date</p>
                <div className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm font-medium">
                    {formatDateTime(task.dueDate)}
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {getRelativeTime(task.dueDate)}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Assignees */}
          <div className="px-6 py-3">
            <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2 opacity-70" />
              Assignees ({assignees.length})
            </h3>

            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                {assignees.length > 0 ? (
                  assignees.map((assignee) => (
                    <Tooltip key={assignee.id}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage
                              src={`https://api.dicebear.com/5.x/initials/svg?seed=${assignee.name}`}
                              alt={assignee.name}
                            />
                            <AvatarFallback className="text-xs">
                              {assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium truncate max-w-32">
                            {assignee.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{assignee.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
                ) : (
                  <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500">No assignees</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Assign team members to this task
                    </p>
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-6 mt-4">
            <div className="flex justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => onEditClick(task)}
                className="flex-1 border-2"
                size="sm"
              >
                <PencilIcon className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDeleteClick(task)}
                className="flex-1"
                size="sm"
              >
                <TrashIcon className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
