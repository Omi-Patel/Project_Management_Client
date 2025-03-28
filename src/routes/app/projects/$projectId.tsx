import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { getProjectById, createTask, getAllUsers } from "@/lib/actions"; // Import necessary actions
import { ProjectSchema } from "@/schemas/project-schema";
import { LoadingScreen } from "@/components/LoadingScreen";
import TaskList from "../../../components/TaskList";
import { Button } from "@/components/ui/button"; // Import Button component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import Dialog components
import { Input } from "@/components/ui/input"; // Import Input component
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TaskRequest, TaskResponse } from "@/schemas/task_schema";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const projectId = params.projectId;
    const project = await getProjectById(projectId); // Fetch project details by ID
    return project as ProjectSchema;
  },
  pendingComponent: () => {
    return <LoadingScreen />;
  },
});

function RouteComponent() {
  const project = Route.useLoaderData();
  const { projectId } = useParams({ from: "/app/projects/$projectId" });
  
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [taskTitle, setTaskTitle] = useState(""); // State for task title
  const [taskDescription, setTaskDescription] = useState(""); // State for task description
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM"
  ); // State for task priority
  const [taskStatus, setTaskStatus] = useState<
    "TO_DO" | "IN_PROGRESS" | "DONE"
  >("TO_DO"); // State for task status
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]); // State for assignee IDs
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission
  const [tasks, setTasks] = useState(project.taskIds || []); // State for task list
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]); // State for users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers(); // Fetch all users
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async (newTask: TaskResponse) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", project.id] });
      setTasks((prevTasks) => [...prevTasks, newTask.id]);
      setTaskTitle("");
      setTaskDescription("");
      setTaskPriority("MEDIUM");
      setTaskStatus("TO_DO");
      setAssigneeIds([]);
      setOpen(false);
      toast.success("Task created successfully!");
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleAddTask = async () => {
    setIsSubmitting(true);
    createTaskMutation.mutate({
      projectId: project.id!,
      title: taskTitle,
      description: taskDescription,
      assigneeIds,
      status: taskStatus,
      priority: taskPriority,
    });
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block cursor-pointer">
                  <BreadcrumbLink
                    onClick={() => navigate({ to: "/app/projects" })}
                  >
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{project.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>

      <Separator className="mb-4" />

      <div className="p-4">
        <h1 className="text-2xl font-bold text-primary">{project.name}</h1>
        <p className="text-primary mt-2 border p-4 rounded-lg">
          {project.description || "No description available"}
        </p>
        <div className="mt-4 text-sm text-primary">
          <p>
            <strong>Start Date:</strong>{" "}
            {project.startDate
              ? new Date(project.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            <strong>End Date:</strong>{" "}
            {project.endDate
              ? new Date(project.endDate).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Task List Section */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Tasks</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="">
                + Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new task.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task Title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Task Description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  disabled={isSubmitting}
                />
                <Select
                  value={taskPriority}
                  onValueChange={(value) =>
                    setTaskPriority(value as "LOW" | "MEDIUM" | "HIGH")
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={taskStatus}
                  onValueChange={(value) =>
                    setTaskStatus(value as "TO_DO" | "IN_PROGRESS" | "DONE")
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TO_DO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>

                <div className="border rounded-md p-2">
                  <p className="text-sm text-primary mb-2">
                    Assign Users to this Task
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button className=" bg-primary text-left">
                        {assigneeIds.length > 0
                          ? `Assigned to ${assigneeIds.length} user(s)`
                          : "Select Users"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="py-2 flex justify-end">
                        <Button
                          variant={"outline"}
                          className="text-red-500 text-sm hover:text-red-500"
                          onClick={() => setAssigneeIds([])} // Clear all selected users
                        >
                          Clear All
                        </Button>
                      </div>
                      <div className="max-h-40 overflow-y-hidden">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-2 mb-2"
                          >
                            <Checkbox
                              checked={assigneeIds.includes(user.id)} // Check if the user is already selected
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setAssigneeIds((prev) => [...prev, user.id]); // Add user to the list
                                } else {
                                  setAssigneeIds((prev) =>
                                    prev.filter((id) => id !== user.id)
                                  ); // Remove user from the list
                                }
                              }}
                            />
                            <span className="text-sm">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddTask}
                  className=""
                  disabled={isSubmitting || !taskTitle}
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <TaskList taskIds={tasks} projectId={projectId} /> {/* Pass updated taskIds to TaskList */}
      </div>
    </SidebarInset>
  );
}
