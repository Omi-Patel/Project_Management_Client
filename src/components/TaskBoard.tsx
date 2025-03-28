"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { updateTaskStatus } from "@/lib/actions"; // Import the update function
import { Badge } from "./ui/badge";

// Task type
interface Task {
  id: string;
  title: string;
  status: "TO_DO" | "IN_PROGRESS" | "DONE";
  priority: string;
}

interface TaskBoardProps {
  initialTasks: Task[];
}

const TaskBoard = ({ initialTasks }: TaskBoardProps) => {
  const [tasks, setTasks] = useState(initialTasks);

  // Group tasks by status
  const taskColumns = {
    TO_DO: tasks.filter((task) => task.status === "TO_DO"),
    IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
    DONE: tasks.filter((task) => task.status === "DONE"),
  };

  // Handle Drag End
  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;

    // If dropped outside valid destination, return
    if (!destination) return;

    // If the position didn't change, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the dragged task
    const updatedTask = tasks.find((task) => task.id === draggableId);
    if (!updatedTask) return;

    // Update the task status
    const newStatus = destination.droppableId as
      | "TO_DO"
      | "IN_PROGRESS"
      | "DONE";
    updatedTask.status = newStatus;

    // Update state optimistically
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === draggableId ? updatedTask : task))
    );

    // Call API to persist the update
    try {
      await updateTaskStatus(updatedTask.id, newStatus); // Call the update function
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      // Revert state if API call fails
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === draggableId
            ? { ...task, status: source.droppableId }
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
                            ? "bg-blue-200" // Light blue for TO_DO
                            : task.status === "IN_PROGRESS"
                              ? "bg-yellow-200" // Light yellow for IN_PROGRESS
                              : "bg-green-200" // Light green for DONE
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold tracking-wide dark:text-black">
                            {task.title}
                          </span>
                          <Badge
                            className={`text-[10px] font-bold ${
                              task.priority === "LOW"
                                ? "bg-green-400" // Light blue for TO_DO
                                : task.priority === "MEDIUM"
                                  ? "bg-yellow-400" // Light yellow for IN_PROGRESS
                                  : "bg-red-400" // Light green for DONE
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
