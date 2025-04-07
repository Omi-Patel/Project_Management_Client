"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { getUserById } from "@/lib/actions";
import type { TaskResponse } from "@/schemas/task_schema";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

import { TaskDetailsSheet } from "./task-details-sheet";
import { TaskFormDialog } from "./task-form-dialog";
import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskTable } from "./task-table";

interface User {
  id: string;
  name: string;
}

interface TaskListProps {
  tasks: TaskResponse[];
  projectId: string;
}

export function TaskList({ tasks, projectId }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [assignees, setAssignees] = useState<User[]>([]);
  const [taskAssignees, setTaskAssignees] = useState<Record<string, User[]>>(
    {}
  );

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskResponse | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch all assignees for all tasks when tasks change
  const { data: assigneeMap = {}, isLoading: isAssigneesLoading } = useQuery({
    queryKey: ["assignees", tasks],
    queryFn: async () => {
      // Collect all unique assignee IDs across all tasks
      const allAssigneeIds = tasks
        .flatMap((task) => task.assigneeIds || [])
        .filter((id, index, self) => self.indexOf(id) === index); // Deduplicate IDs

      if (allAssigneeIds.length === 0) {
        return {};
      }

      // Fetch all unique assignees in a single batch
      const fetchedAssignees = await Promise.all(
        allAssigneeIds.map((id) => getUserById(id))
      );

      // Create a map of assignee IDs to user objects
      return fetchedAssignees
        .filter((user) => user !== null)
        .reduce(
          (map, user) => {
            map[user!.id] = user!;
            return map;
          },
          {} as Record<string, User>
        );
    },
    enabled: tasks.length > 0, // Only fetch if there are tasks
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  // Map the fetched assignees back to their respective tasks
  useEffect(() => {
    if (!isAssigneesLoading) {
      const assigneesMap: Record<string, User[]> = {};
      tasks.forEach((task) => {
        assigneesMap[task.id] =
          task.assigneeIds?.map((id) => assigneeMap[id]).filter(Boolean) || [];
      });
      setTaskAssignees(assigneesMap);
    }
  }, [tasks, assigneeMap, isAssigneesLoading]);

  // Handle task click to show details
  const handleTaskClick = async (task: TaskResponse) => {
    setSelectedTask(task);
    setIsSheetOpen(true);

    // Use already fetched assignees if available
    if (taskAssignees[task.id]) {
      setAssignees(taskAssignees[task.id]);
    } else if (task.assigneeIds && task.assigneeIds.length > 0) {
      try {
        // Deduplicate assignee IDs here as well
        const uniqueAssigneeIds = [...new Set(task.assigneeIds)];

        const fetchedAssignees = await Promise.all(
          uniqueAssigneeIds.map((id) => getUserById(id))
        );
        setAssignees(
          fetchedAssignees.filter((user) => user !== null) as User[]
        );
      } catch (error) {
        console.error("Failed to fetch assignees:", error);
        setAssignees([]);
      }
    } else {
      setAssignees([]);
    }
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = async (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  // Handle task update success
  const handleTaskUpdated = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    router.invalidate();
    setIsEditDialogOpen(false);
    setIsAddDialogOpen(false);
  };

  const handleTaskDelete = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    router.invalidate();
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const dedupedTasksMap = new Map<string, TaskResponse>();

  tasks.forEach((task) => {
    if (!dedupedTasksMap.has(task.id)) {
      dedupedTasksMap.set(task.id, { ...task });
    } else {
      // If already exists, merge assigneeIds
      const existing = dedupedTasksMap.get(task.id)!;
      const mergedAssigneeIds = Array.from(
        new Set([...(existing.assigneeIds || []), ...(task.assigneeIds || [])])
      );
      dedupedTasksMap.set(task.id, {
        ...existing,
        assigneeIds: mergedAssigneeIds,
      });
    }
  });

  const dedupedTasks = Array.from(dedupedTasksMap.values());

  return (
    <div>
      {tasks.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">
            No tasks found for this project
          </p>
        </div>
      ) : (
        <TaskTable
          tasks={dedupedTasks}
          taskAssignees={taskAssignees}
          onTaskClick={handleTaskClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      )}

      {/* Task Details Sheet */}
      <TaskDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        task={selectedTask}
        assignees={assignees}
        onEditClick={(task) => {
          setIsSheetOpen(false);
          handleEditClick(new MouseEvent("click") as any, task);
        }}
        onDeleteClick={(task) => {
          setIsSheetOpen(false);
          handleDeleteClick(new MouseEvent("click") as any, task);
        }}
      />

      {/* Task Form Dialog */}
      <TaskFormDialog
        isOpen={isEditDialogOpen || isAddDialogOpen}
        onOpenChange={(open) => {
          if (isEditDialogOpen) setIsEditDialogOpen(open);
          if (isAddDialogOpen) setIsAddDialogOpen(open);
        }}
        task={selectedTask}
        projectId={projectId}
        mode={isEditDialogOpen ? "edit" : "add"}
        onSuccess={handleTaskUpdated}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        task={taskToDelete}
        onSuccess={handleTaskDelete}
      />
    </div>
  );
}

export default TaskList;
