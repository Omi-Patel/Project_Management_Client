"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, differenceInDays, isToday, isPast } from "date-fns";
import { getBadgeColor } from "@/lib/task-utils";
import type { TaskResponse } from "@/schemas/task_schema";
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface TaskGanttMobileProps {
  tasks: TaskResponse[];
  projectId?: string;
}

const TaskGanttMobile = ({ tasks }: TaskGanttMobileProps) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const timelineData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const tasksWithDueDates = tasks.filter((task) => task.dueDate);
    if (tasksWithDueDates.length === 0) return [];

    // Calculate timeline range
    const dueDates = tasksWithDueDates.map((task) => new Date(task.dueDate!));
    const minDate = new Date(Math.min(...dueDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dueDates.map((d) => d.getTime())));
    const totalDays = differenceInDays(maxDate, minDate) + 1;

    return tasksWithDueDates
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        const daysUntilDue = differenceInDays(dueDate, new Date());

        // Calculate timeline position (0-100)
        const daysFromStart = differenceInDays(dueDate, minDate);
        const timelinePosition = Math.max(
          0,
          Math.min(100, (daysFromStart / totalDays) * 100)
        );

        // Calculate progress based on status
        let progress = 0;
        switch (task.status) {
          case "DONE":
            progress = 100;
            break;
          case "IN_PROGRESS":
            progress = 50;
            break;
          case "TO_DO":
            progress = 0;
            break;
        }

        return {
          taskId: task.id,
          taskName: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          isOverdue,
          daysUntilDue,
          projectName: task.project?.name || "Unknown Project",
          progress,
          timelinePosition,
        };
      })
      .sort((a, b) => Number(a.dueDate || 0) - Number(b.dueDate || 0));
  }, [tasks]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return timelineData.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [timelineData, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-amber-500";
      case "TO_DO":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "text-green-600";
      case "IN_PROGRESS":
        return "text-amber-600";
      case "TO_DO":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getTimelineLabel = (position: number) => {
    if (position <= 25) return "Early";
    if (position <= 50) return "Mid";
    if (position <= 75) return "Late";
    return "End";
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-lg font-semibold">Task Timeline</span>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks found</p>
          </div>
        </div>
      </div>
    );
  }

  const tasksWithDueDates = tasks.filter((task) => task.dueDate);

  if (tasksWithDueDates.length === 0) {
    return (
      <div className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-lg font-semibold">Task Timeline</span>
          </div>
        </div>
        <div className="p-4">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No tasks with due dates found
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Add due dates to tasks to see them in the timeline
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
      <div className="p-4 border-b">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="text-lg font-semibold">Task Timeline</span>
            <Badge variant="outline" className="ml-2">
              {filteredData.length} tasks
            </Badge>
          </div>

          {/* Mobile-friendly filters */}
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-20 sm:w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="TO_DO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-20 sm:w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {/* Timeline Legend */}
          <div className="flex flex-wrap gap-3 text-xs p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span>To Do</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span>Done</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500"></div>
              <span>Overdue</span>
            </div>
          </div>

          {/* Mobile Timeline View */}
          <div className="space-y-3">
            {filteredData.map((task) => (
              <Collapsible
                key={task.taskId}
                open={expandedTasks.has(task.taskId)}
                onOpenChange={() => toggleTaskExpansion(task.taskId)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {/* Status indicator */}
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}
                      />

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {task.taskName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate hidden sm:block">
                          {task.projectName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Priority badge */}
                      <Badge
                        className={`text-xs ${getBadgeColor(task.priority)} hidden sm:inline-flex`}
                      >
                        {task.priority}
                      </Badge>

                      {/* Timeline position */}
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {getTimelineLabel(task.timelinePosition)}
                      </div>

                      {/* Expand/collapse icon */}
                      {expandedTasks.has(task.taskId) ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-3 bg-muted/20 rounded-lg mt-2 space-y-3">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={getStatusTextColor(task.status)}>
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(task.status)}`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status and due date */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-xs">
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {task.dueDate
                            ? format(new Date(task.dueDate), "MMM dd")
                            : "No due date"}
                        </span>
                      </div>
                    </div>

                    {/* Due date info */}
                    {task.isOverdue && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded text-xs">
                        <AlertCircle className="h-3 w-3" />
                        <span>
                          Overdue by {Math.abs(task.daysUntilDue)} days
                        </span>
                      </div>
                    )}
                    {!task.isOverdue && task.daysUntilDue > 0 && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-2 rounded text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{task.daysUntilDue} days remaining</span>
                      </div>
                    )}
                    {task.daysUntilDue === 0 && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Due today</span>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Task Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6">
            <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {tasksWithDueDates.filter((t) => t.status === "TO_DO").length}
              </div>
              <div className="text-xs text-muted-foreground">To Do</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-amber-600">
                {
                  tasksWithDueDates.filter((t) => t.status === "IN_PROGRESS")
                    .length
                }
              </div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {tasksWithDueDates.filter((t) => t.status === "DONE").length}
              </div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-red-600">
                {
                  tasksWithDueDates.filter((t) => {
                    if (!t.dueDate) return false;
                    return new Date(t.dueDate) < new Date();
                  }).length
                }
              </div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskGanttMobile;
