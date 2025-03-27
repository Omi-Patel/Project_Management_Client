import { useEffect, useState } from "react";
import { getTaskById, getUserById } from "@/lib/actions";
import { type TaskResponse } from "@/schemas/task_schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Badge } from "@/components/ui/badge"; // Import Badge component
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

interface TaskListProps {
  taskIds: string[];
}

interface User {
  id: string;
  name: string;
}

function TaskList({ taskIds }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null); // State for selected task
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State for sheet visibility
  const [assignees, setAssignees] = useState<User[]>([]); // State for task assignees

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await Promise.all(
          taskIds.map((id) => getTaskById(id)) // Fetch each task by ID
        );
        setTasks(
          fetchedTasks.filter((task) => task !== null) as TaskResponse[]
        );
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [taskIds]);

  const handleTaskClick = async (task: TaskResponse) => {
    setSelectedTask(task); // Set the selected task
    setIsSheetOpen(true); // Open the sheet

    // Fetch assignees for the selected task
    if (task.assigneeIds && task.assigneeIds.length > 0) {
      try {
        const fetchedAssignees = await Promise.all(
          task.assigneeIds.map((id) => getUserById(id)) // Fetch each user by ID
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

  const getBadgeColor = (value: string) => {
    switch (value.toLowerCase()) {
      case "todo":
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

  if (tasks.length === 0) {
    return <p>No tasks available for this project.</p>;
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
          {tasks.map((task) => (
            <TableRow
              key={task.id}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => handleTaskClick(task)} // Open sheet on row click
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
                {task.assigneeIds.length > 0
                  ? `${task.assigneeIds.length} user(s)`
                  : "Unassigned"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-300 p-1 rounded-sm"
                    title="View Details"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-300 p-1 rounded-sm"
                    title="Delete Task"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
            <div className="flex  mt-4">
              {assignees.map((assignee) => (
                <Tooltip key={assignee.id}>
                  <TooltipTrigger>
                    <Avatar className="cursor-pointer">
                      <AvatarImage
                        src={`https://api.dicebear.com/5.x/initials/svg?seed=${assignee.name}`}
                        alt={assignee.name}
                      />
                      <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{assignee.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default TaskList;
