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
import { getWorkspaceMembersForTasks } from "@/lib/workspace-actions";
import { toast } from "sonner";
import type { TaskResponse } from "@/schemas/task_schema";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Check, Search, User, Users } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

// Task schema for form validation
const TaskFormSchema = z.object({
  id: z.string().optional().nullable(),
  projectId: z.string(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["TO_DO", "IN_PROGRESS", "DONE"]).default("TO_DO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
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
  workspaceId?: string;
}

export function TaskFormDialog({
  isOpen,
  onOpenChange,
  task,
  projectId,
  mode,
  onSuccess,
  workspaceId,
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
      dueDate: null,
      assigneeIds: [],
    },
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (workspaceId) {
          // If workspaceId is provided, fetch workspace members only
          const userId = localStorage.getItem("pms-userId") || "";
          const workspaceMembers = await getWorkspaceMembersForTasks(workspaceId, userId);
          setUsers(workspaceMembers.map((member: any) => ({
            id: member.userId,
            name: member.userName,
          })));
        } else {
          // Fallback to all users if no workspaceId
        const allUsers = await getAllUsers({ page: 1, size: 1000, search: null });
        setUsers(allUsers);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, workspaceId]);

  // Reset form when task changes or dialog opens
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && task) {
      form.reset({
        id: task.id,
        projectId: task.project.id ?? "",
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).getTime().toString()
          : null,
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
        dueDate: null,
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

  const [searchQuery, setSearchQuery] = useState("");
  const [userOpen, setUserOpen] = useState(false);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            {/* Set Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`
                w-full justify-start text-left font-normal
                ${!field.value ? "text-muted-foreground" : ""}
              `}
                        >
                          {field.value
                            ? format(
                                new Date(Number(field.value)),
                                "yyyy-MM-dd"
                              )
                            : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value
                            ? new Date(Number(field.value))
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            // Convert selected date to epoch time (milliseconds)
                            const epochTime = date.getTime();
                            field.onChange(epochTime.toString());
                          }
                        }}
                        disabled={(date) => date < new Date()} // Disable past dates
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Assignment Section */}
            <FormField
              control={form.control}
              name="assigneeIds"
              render={() => (
                <FormItem>
                  <FormLabel className="font-medium">Assign Users</FormLabel>
                  <div>
                    <Popover open={userOpen} onOpenChange={setUserOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-between border-input bg-background px-3 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {assigneeIds.length > 0
                                ? `${assigneeIds.length} user${assigneeIds.length > 1 ? "s" : ""} assigned`
                                : "Select Users"}
                            </span>
                          </div>
                          {assigneeIds.length > 0 && (
                            <div className="bg-primary/10 text-primary rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium">
                              {assigneeIds.length}
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <div className="border-b p-2 sticky top-0 bg-popover z-10">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                              placeholder="Search users..."
                              className="w-full rounded-md border border-input px-8 py-2 text-sm"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="p-2 border-b">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {assigneeIds.length > 0 ? (
                                <span className="text-muted-foreground">
                                  Selected:{" "}
                                  <span className="text-foreground font-semibold">
                                    {assigneeIds.length}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  No users selected
                                </span>
                              )}
                            </p>
                            {assigneeIds.length > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive text-xs hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setAssigneeIds([])}
                              >
                                Clear all
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto p-1">
                          {users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <User className="h-8 w-8 text-muted-foreground/50 mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Loading users...
                              </p>
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <Search className="h-8 w-8 text-muted-foreground/50 mb-2" />
                              <p className="text-sm text-muted-foreground">
                                No users found
                              </p>
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                                onClick={() => {
                                  if (assigneeIds.includes(user.id)) {
                                    setAssigneeIds((prev) =>
                                      prev.filter((id) => id !== user.id)
                                    );
                                  } else {
                                    setAssigneeIds((prev) => [
                                      ...prev,
                                      user.id,
                                    ]);
                                  }
                                }}
                              >
                                <div className="flex items-center border rounded w-4 h-4 justify-center">
                                  <Checkbox
                                    checked={assigneeIds.includes(user.id)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-3 w-3 text-primary" />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {user.name}
                                  </span>
                                </div>
                                {assigneeIds.includes(user.id) && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="p-2 border-t flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setUserOpen(false)}
                          >
                            Done
                          </Button>
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
