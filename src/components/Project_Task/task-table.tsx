"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PencilIcon, TrashIcon, MessageSquare } from "lucide-react";
import type { TaskResponse } from "@/schemas/task_schema";
import { getBadgeColor } from "@/lib/task-utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getCommentCount } from "@/lib/actions";

interface TaskTableProps {
  tasks: TaskResponse[];
  taskAssignees: Record<string, User[]>;
  workspaces: Record<string, Workspace>;
  onTaskClick: (task: TaskResponse) => void;
  onEditClick: (e: React.MouseEvent, task: TaskResponse) => void;
  onDeleteClick: (e: React.MouseEvent, task: TaskResponse) => void;
}

interface User {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
}

// Component to display comment count for a task
function TaskCommentCount({ taskId }: { taskId: string }) {
  const { data: count = 0, isLoading } = useQuery({
    queryKey: ["commentCount", taskId],
    queryFn: () => getCommentCount(taskId),
    staleTime: 30 * 1000, // 30 seconds
  });

  if (isLoading) {
    return <span className="text-xs text-gray-400">...</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <MessageSquare className="h-3 w-3 text-gray-500" />
      <span className="text-xs text-gray-600">{count}</span>
    </div>
  );
}

export function TaskTable({
  tasks,
  taskAssignees,
  workspaces,
  onTaskClick,
  onEditClick,
  onDeleteClick,
}: TaskTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sr. No.</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assignees</TableHead>
          <TableHead>Comments</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-4">
              No tasks available for this project.
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task, index) => {
            const workspace = task.project?.workspaceId ? workspaces[task.project.workspaceId] : null;
            
            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onTaskClick(task)}
              >
                <TableCell>{index + 1}.</TableCell>
                
                <TableCell>
                  <Badge className="text-black font-semibold tracking-wide" style={{ backgroundColor: `${task.project.color}` }}>
                    {task.project.name}
                  </Badge>
                </TableCell>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <Badge
                    className={`${getBadgeColor(task.status)} text-[11px] font-bold text-black`}
                  >
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getBadgeColor(task.priority)} text-[11px] font-bold text-black`}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center ">
                  {taskAssignees[task.id]?.length ? (
                    taskAssignees[task.id].map((assignee) => (
                      <div key={assignee.id} className="flex items-center gap-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`https://api.dicebear.com/5.x/initials/svg?seed=${assignee.name}`}
                            alt={assignee.name}
                          />
                          <AvatarFallback className="text-xs">
                            {assignee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {/* <span className="text-sm">{assignee.name}</span> */}
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      Unassigned
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  <TaskCommentCount taskId={task.id} />
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => onEditClick(e, task)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-300 p-1 rounded-sm"
                      title="Edit Task"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => onDeleteClick(e, task)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-300 p-1 rounded-sm"
                      title="Delete Task"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
