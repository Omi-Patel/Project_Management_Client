"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { updateTaskStatus, getTaskById } from "@/lib/actions";
import { Badge } from "./ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskResponse } from "@/schemas/task_schema";
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { getBadgeColor } from "@/lib/task-utils";

interface TaskBoardProps {
  taskIds: string[];
}

const TaskBoard = ({ taskIds }: TaskBoardProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", taskIds],
    queryFn: async () => {
      const fetchedTasks = await Promise.all(
        taskIds.map((id) => getTaskById(id))
      );
      return fetchedTasks;
    },
  });

  const [localTasks, setLocalTasks] = useState<TaskResponse[]>([]);

  const queryClient = useQueryClient();

  // Sync state when tasks are fetched
  useEffect(() => {
    if (tasks) {
      setLocalTasks(
        tasks.filter((task): task is TaskResponse => task !== null)
      );
    }
  }, [tasks]);

  // Group tasks by status
  const taskColumns = {
    TO_DO: localTasks.filter((task) => task.status === "TO_DO"),
    IN_PROGRESS: localTasks.filter((task) => task.status === "IN_PROGRESS"),
    DONE: localTasks.filter((task) => task.status === "DONE"),
  };

  // Handle Drag End
  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedTask = localTasks.find((task) => task.id === draggableId);
    if (!updatedTask) return;

    const newStatus = destination.droppableId as
      | "TO_DO"
      | "IN_PROGRESS"
      | "DONE";
    updatedTask.status = newStatus;

    setLocalTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === draggableId ? updatedTask : task))
    );

    try {
      await updateTaskStatus(updatedTask.id, newStatus);
      toast.success(`Task moved to ${newStatus}`);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === draggableId
            ? {
                ...task,
                status: source.droppableId as "TO_DO" | "IN_PROGRESS" | "DONE",
              }
            : task
        )
      );
      toast.error("Failed to update task status");
    }
  };

  const getColumnIcon = (status: string) => {
    switch (status) {
      case "TO_DO":
        return <Circle className="h-5 w-5 text-blue-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "DONE":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getColumnTitle = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "To Do";
      case "IN_PROGRESS":
        return "In Progress";
      case "DONE":
        return "Done";
      default:
        return status;
    }
  };

  const getColumnColor = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "border-blue-500/20 bg-blue-500/5";
      case "IN_PROGRESS":
        return "border-amber-500/20 bg-amber-500/5";
      case "DONE":
        return "border-green-500/20 bg-green-500/5";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getTaskColor = (status: string) => {
    switch (status) {
      case "TO_DO":
        return "border-blue-200 bg-secondary";
      case "IN_PROGRESS":
        return "border-amber-200 bg-secondary";
      case "DONE":
        return "border-green-200 bg-secondary";
      default:
        return "border-gray-200 bg-secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["TO_DO", "IN_PROGRESS", "DONE"].map((status) => (
          <div key={status} className="border rounded-lg p-4 bg-secondary/50">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-3">
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-700 font-medium">Failed to load tasks</p>
        <p className="text-red-600 text-sm mt-1">
          Please try refreshing the page
        </p>
      </div>
    );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(taskColumns).map(([status, tasks]) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`border rounded-lg shadow-sm transition-colors duration-300 ease-in-out ${getColumnColor(
                  status
                )} ${snapshot.isDraggingOver ? "ring-2 ring-primary/30 bg-muted/10" : ""}`}
              >
                <div className="p-3 border-b sticky top-0 bg-inherit rounded-t-lg z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getColumnIcon(status)}
                      <h2 className="text-base font-semibold">
                        {getColumnTitle(status)}
                      </h2>
                      <Badge
                        variant="outline"
                        className="ml-1 text-xs font-medium"
                      >
                        {tasks.length}
                      </Badge>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 min-h-[300px] transition-all duration-300 ease-in-out">
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center border border-dashed rounded-md p-4 mt-2 transition-all duration-300 ease-in-out">
                      <p className="text-sm text-muted-foreground">
                        No tasks in this column
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Drag tasks here or add new ones
                      </p>
                    </div>
                  ) : (
                    tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg border shadow-sm mb-3 transform transition-all duration-200 ease-in-out ${getTaskColor(
                              task.status
                            )} ${
                              snapshot.isDragging
                                ? "shadow-lg scale-[1.02] ring-2 ring-primary/20 rotate-1"
                                : ""
                            }`}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-sm tracking-wide line-clamp-2">
                                  {task.title}
                                </h3>
                                <Badge
                                  className={`text-[10px] font-medium ml-1 text-black ${getBadgeColor(task.priority)}`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>

                              {/* {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )} */}

                              <div className="flex justify-between items-center mt-1">
                                {task.assigneeIds.length > 0 && (
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {task.assigneeIds.length}{" "}
                                    {task.assigneeIds.length === 1
                                      ? "Assignee"
                                      : "Assignees"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
