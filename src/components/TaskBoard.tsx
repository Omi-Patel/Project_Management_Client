"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { updateTaskStatus, getTaskById } from "@/lib/actions"; // Import the update function
import { Badge } from "./ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TaskResponse } from "@/schemas/task_schema";

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

  if (isLoading) return <p>Loading tasks...</p>;
  if (error) return <p className="text-red-500">Failed to load tasks.</p>;

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(taskColumns).map(([status, tasks]) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-secondary p-4 rounded-lg min-h-[300px]"
              >
                <h2 className="text-lg font-bold mb-2">
                  {status.replace("_", " ")}
                </h2>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 rounded-lg shadow-md mb-2 ${
                          task.status === "TO_DO"
                            ? "bg-blue-200"
                            : task.status === "IN_PROGRESS"
                              ? "bg-yellow-200"
                              : "bg-green-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold tracking-wide dark:text-black">
                            {task.title}
                          </span>
                          <Badge
                            className={`text-[10px] font-bold ${
                              task.priority === "LOW"
                                ? "bg-green-400"
                                : task.priority === "MEDIUM"
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                            }`}
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
