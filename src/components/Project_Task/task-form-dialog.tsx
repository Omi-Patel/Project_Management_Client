"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask, getAllUsers } from "@/lib/actions";
import { toast } from "sonner";
import type { TaskResponse } from "@/schemas/task_schema";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";

// Task schema for form validation
const TaskFormSchema = z.object({
  id: z.string().optional().nullable(),
  projectId: z.string(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).default("TO_DO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  assigneeIds: z.array(z.string()).optional().default([]), // Made optional
});

type TaskFormValues = z.infer<typeof TaskFormSchema>;

interface User {
  id: string;
  name: string;
}

interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskResponse | null;
  projectId: string;
  mode: "add" | "edit";
  onSuccess: () => void;
}

export function TaskFormDialog({
  isOpen,
  onOpenChange,
  task,
  projectId,
  mode,
  onSuccess,
}: TaskFormDialogProps) {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<User[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  // Form setup
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      id: null,
      projectId: projectId,
      title: "",
      description: "",
      status: "TO_DO",
      priority: "MEDIUM",
      assigneeIds: [],
    },
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && task) {
      form.reset({
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assigneeIds: task.assigneeIds || [],
      });
      setAssigneeIds(task.assigneeIds || []);
    } else if (mode === "add") {
      form.reset({
        id: null,
        projectId: projectId,
        title: "",
        description: "",
        status: "TO_DO",
        priority: "MEDIUM",
        assigneeIds: [],
      });
      setAssigneeIds([]);
    }
  }, [form, task, mode, projectId, isOpen]);

  // Update form when assigneeIds change
  useEffect(() => {
    form.setValue("assigneeIds", assigneeIds);
  }, [assigneeIds, form]);

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task created successfully");
      onSuccess();
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
      toast.success("Task updated successfully");
      onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update task. Please try again.");
    },
  });

  // Handle form submission
  const onSubmit = (data: TaskFormValues) => {
    // Ensure assigneeIds is an array even if empty
    const formData = {
      ...data,
      assigneeIds: data.assigneeIds || [],
    };

    if (formData.id) {
      // Update existing task
      updateMutation.mutate(formData);
    } else {
      // Create new task
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = mode === "edit" ? "Edit Task" : "Add New Task";
  const description =
    mode === "edit"
      ? "Update the task details below."
      : "Fill in the details below to create a new task.";
  const submitText =
    mode === "edit"
      ? isPending
        ? "Saving..."
        : "Save Changes"
      : isPending
        ? "Creating..."
        : "Create Task";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TO_DO">
                          <Badge className="bg-blue-400">TODO</Badge>
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          <Badge className="bg-yellow-400">IN PROGRESS</Badge>
                        </SelectItem>
                        <SelectItem value="DONE">
                          <Badge className="bg-green-400">DONE</Badge>
                        </SelectItem>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">
                          <Badge className="bg-green-400">LOW</Badge>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                          <Badge className="bg-yellow-400">MEDIUM</Badge>
                        </SelectItem>
                        <SelectItem value="HIGH">
                          <Badge className="bg-red-400">HIGH</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* User Assignment Section */}
            <FormField
              control={form.control}
              name="assigneeIds"
              render={() => (
                <FormItem>
                  <FormLabel>Assign Users (Optional)</FormLabel>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" className=" justify-start">
                          {assigneeIds.length > 0
                            ? `Assigned to ${assigneeIds.length} user(s)`
                            : "Select Users (Optional)"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="py-2 flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 text-sm hover:text-red-500"
                            onClick={() => setAssigneeIds([])}
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="max-h-40 overflow-y-auto">
                          {users.length === 0 ? (
                            <p className="text-sm text-muted-foreground p-2">
                              Loading users...
                            </p>
                          ) : (
                            users.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-2 mb-2"
                              >
                                <Checkbox
                                  checked={assigneeIds.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setAssigneeIds((prev) => [
                                        ...prev,
                                        user.id,
                                      ]);
                                    } else {
                                      setAssigneeIds((prev) =>
                                        prev.filter((id) => id !== user.id)
                                      );
                                    }
                                  }}
                                />
                                <span className="text-sm">{user.name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.getValues().title}
              >
                {submitText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
