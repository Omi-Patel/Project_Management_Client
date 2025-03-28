"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  getTaskById,
  getUserById,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/actions";
import type { TaskResponse } from "@/schemas/task_schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

// Task schema for form validation
const TaskFormSchema = z.object({
  id: z.string().nullable().optional(),
  projectId: z.string(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).default("TO_DO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  assigneeIds: z.array(z.string()).default([]),
});

type TaskFormValues = z.infer<typeof TaskFormSchema>;

interface TaskListProps {
  taskIds: string[];
  projectId: string;
}

interface User {
  id: string;
  name: string;
}

function TaskList({ taskIds, projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [assignees, setAssignees] = useState<User[]>([]);

  // State for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [setIsAddDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskResponse | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Form setup
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      id: selectedTask?.id,
      projectId: selectedTask?.projectId,
      title: selectedTask?.title,
      description: selectedTask?.description,
      status: selectedTask?.status,
      priority: selectedTask?.priority,
      assigneeIds: selectedTask?.assigneeIds,
    },
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      await fetchTasks(); // Refresh tasks after mutation
      setIsAddDialogOpen(false);
      toast.success("Task created successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create task. Please try again.");
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      await fetchTasks(); // Refresh tasks after mutation
      setIsEditDialogOpen(false);
      toast.success("Task updated successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update task. Please try again.");
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      await fetchTasks(); // Refresh tasks after mutation
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      toast.success("Task deleted successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete task. Please try again.");
    },
  });

  // Fetch tasks function
  const fetchTasks = async () => {
    try {
      const fetchedTasks = await Promise.all(
        taskIds.map((id) => getTaskById(id))
      );
      setTasks(fetchedTasks.filter((task) => task !== null) as TaskResponse[]);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [taskIds]);

  // Handle task click to show details
  const handleTaskClick = async (task: TaskResponse) => {
    setSelectedTask(task);
    setIsSheetOpen(true);

    if (task.assigneeIds && task.assigneeIds.length > 0) {
      try {
        const fetchedAssignees = await Promise.all(
          task.assigneeIds.map((id) => getUserById(id))
        );
        setAssignees(
          fetchedAssignees.filter((user) => user !== null) as User[]
        );
      } catch (error) {
        console.error("Failed to fetch assignees:", error);
      }
    } else {
      setAssignees([]);
    }
  };

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation();
    setSelectedTask(task);
    form.reset({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assigneeIds: task.assigneeIds,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation();
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    if (data.id) {
      // Update existing task
      updateMutation.mutate(data);
    } else {
      // Create new task
      createMutation.mutate({
        ...data,
      });
    }
  };

  // Handle task deletion
  const confirmDelete = () => {
    if (taskToDelete?.id) {
      deleteMutation.mutate(taskToDelete.id);
    }
  };

  const getBadgeColor = (value: string) => {
    switch (value.toLowerCase()) {
      case "todo":
      case "to_do":
        return "bg-blue-500 text-white";
      case "in_progress":
        return "bg-yellow-500 text-white";
      case "done":
        return "bg-green-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "high":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div>
      {/* Task Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No tasks available for this project.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleTaskClick(task)}
              >
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  <Badge className={getBadgeColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getBadgeColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.assigneeIds?.length > 0
                    ? `${task.assigneeIds.length} user(s)`
                    : "Unassigned"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, task)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-300 p-1 rounded-sm"
                      title="Edit Task"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, task)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-300 p-1 rounded-sm"
                      title="Delete Task"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Task Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[350px] p-6">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              {selectedTask?.title}
            </SheetTitle>
            <SheetDescription className="text-gray-600">
              {selectedTask?.description || "No description available"}
            </SheetDescription>
          </SheetHeader>
          {/* Task Properties */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">State</p>
              <Badge className={getBadgeColor(selectedTask?.status || "")}>
                {selectedTask?.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Priority</p>
              <Badge className={getBadgeColor(selectedTask?.priority || "")}>
                {selectedTask?.priority || "None"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-sm font-medium">
                {selectedTask?.createdAt
                  ? new Date(selectedTask.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm font-medium">
                {selectedTask?.updatedAt
                  ? new Date(selectedTask.updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
          {/* Assignees Section */}
          <div className="mt-6">
            <h3 className="text-lg font-bold">Assignees</h3>
            <div className="flex mt-4">
              {assignees.length > 0 ? (
                assignees.map((assignee) => (
                  <Tooltip key={assignee.id}>
                    <TooltipTrigger>
                      <Avatar className="cursor-pointer">
                        <AvatarImage
                          src={`https://api.dicebear.com/5.x/initials/svg?seed=${assignee.name}`}
                          alt={assignee.name}
                        />
                        <AvatarFallback>
                          {assignee.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{assignee.name}</TooltipContent>
                  </Tooltip>
                ))
              ) : (
                <p className="text-sm text-gray-500">No assignees</p>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="mt-8 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsSheetOpen(false);
                handleEditClick(
                  new MouseEvent("click") as any,
                  selectedTask as TaskResponse
                );
              }}
            >
              <PencilIcon className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsSheetOpen(false);
                handleDeleteClick(
                  new MouseEvent("click") as any,
                  selectedTask as TaskResponse
                );
              }}
            >
              <TrashIcon className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter task description"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TO_DO">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS">
                            In Progress
                          </SelectItem>
                          <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{taskToDelete?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaskList;
