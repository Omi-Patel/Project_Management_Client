"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  format,
  addDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  isToday,
  isPast,
  eachDayOfInterval,
} from "date-fns";
import { getBadgeColor } from "@/lib/task-utils";
import type { TaskResponse } from "@/schemas/task_schema";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskGanttHorizontalProps {
  tasks: TaskResponse[];
  projectId?: string;
}

interface TaskTimelineData {
  taskId: string;
  taskName: string;
  status: string;
  priority: string;
  dueDate: Date;
  isOverdue: boolean;
  daysUntilDue: number;
  projectName: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  progress: number;
  barStart: number; // percentage
  barWidth: number; // percentage
}

const TaskGanttHorizontal = ({ tasks }: TaskGanttHorizontalProps) => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "month"
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { timelineData, timelineRange, timelineDays } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        timelineData: [],
        timelineRange: { start: new Date(), end: new Date() },
        timelineDays: [],
      };
    }

    const tasksWithDueDates = tasks.filter((task) => task.dueDate);
    if (tasksWithDueDates.length === 0) {
      return {
        timelineData: [],
        timelineRange: { start: new Date(), end: new Date() },
        timelineDays: [],
      };
    }

    // Calculate timeline range based on selected time range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (timeRange) {
      case "week":
        startDate = startOfDay(addDays(now, -3));
        endDate = endOfDay(addDays(now, 4));
        break;
      case "month":
        startDate = startOfDay(addDays(now, -15));
        endDate = endOfDay(addDays(now, 15));
        break;
      case "quarter":
        startDate = startOfDay(addDays(now, -45));
        endDate = endOfDay(addDays(now, 45));
        break;
      default:
        startDate = startOfDay(addDays(now, -15));
        endDate = endOfDay(addDays(now, 15));
    }

    const totalDays = differenceInDays(endDate, startDate);
    const timelineDays = eachDayOfInterval({ start: startDate, end: endDate });

    const timelineData: TaskTimelineData[] = tasksWithDueDates
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        const isOverdue = isPast(dueDate) && !isToday(dueDate);
        const daysUntilDue = differenceInDays(dueDate, now);

        // Calculate task duration based on priority and status
        let taskDuration = 3;
        switch (task.priority) {
          case "HIGH":
            taskDuration = 2;
            break;
          case "MEDIUM":
            taskDuration = 4;
            break;
          case "LOW":
            taskDuration = 6;
            break;
        }

        const taskStartDate = addDays(dueDate, -taskDuration);
        const taskEndDate = dueDate;
        const duration = differenceInDays(taskEndDate, taskStartDate) + 1;

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

        // Calculate bar position
        const daysFromStart = differenceInDays(taskStartDate, startDate);
        const barStart = Math.max(0, (daysFromStart / totalDays) * 100);
        const barWidth = Math.min(100, (duration / totalDays) * 100);

        return {
          taskId: task.id,
          taskName: task.title,
          status: task.status,
          priority: task.priority,
          dueDate,
          isOverdue,
          daysUntilDue,
          projectName: task.project?.name || "Unknown Project",
          startDate: taskStartDate,
          endDate: taskEndDate,
          duration,
          progress,
          barStart,
          barWidth,
        };
      })
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return {
      timelineData,
      timelineRange: { start: startDate, end: endDate },
      timelineDays,
    };
  }, [tasks, timeRange]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return timelineData.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [timelineData, statusFilter, priorityFilter]);

  const getStatusGradient = (status: string, isOverdue: boolean) => {
    if (isOverdue) return "from-red-500 to-red-600";
    switch (status) {
      case "DONE":
        return "from-emerald-500 to-emerald-600";
      case "IN_PROGRESS":
        return "from-amber-500 to-amber-600";
      case "TO_DO":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const navigateTimeline = (direction: "prev" | "next") => {
    const daysToAdd = direction === "next" ? 7 : -7;
    setCurrentDate(addDays(currentDate, daysToAdd));
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div
        className={`border rounded-lg bg-white dark:bg-gray-900 shadow-sm ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 border-b">
          <div className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            Project Timeline
          </div>
        </div>
        <div className="p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create tasks with due dates to visualize your project timeline
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tasksWithDueDates = tasks.filter((task) => task.dueDate);

  if (tasksWithDueDates.length === 0) {
    return (
      <div
        className={`border rounded-lg bg-white dark:bg-gray-900 shadow-sm ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 border-b">
          <div className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            Project Timeline
          </div>
        </div>
        <div className="p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tasks with due dates
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add due dates to your tasks to see them in the timeline
            </p>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Add Due Dates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={`border rounded-lg bg-white dark:bg-gray-900 shadow-sm overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-xl font-semibold">Project Timeline</div>
              <Badge variant="secondary" className="ml-2">
                {filteredData.length} tasks
              </Badge>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTimeline("prev")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateTimeline("next")}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Select
                value={timeRange}
                onValueChange={(value: "week" | "month" | "quarter") =>
                  setTimeRange(value)
                }
              >
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="TO_DO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="h-8 w-8 p-0"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Minimize" : "Maximize"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Gantt Chart */}
        <div
          className={`overflow-x-auto ${isFullscreen ? "h-[calc(100vh-200px)]" : ""}`}
        >
          <div className="min-w-[800px]">
            {/* Timeline Header */}
            <div className="flex border-b">
              {/* Task Info Column */}
              <div className="w-80 p-4 bg-gray-50 dark:bg-gray-800 border-r">
                <div className="flex flex-col gap-4 justify-between ">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Tasks
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-500"></div>
                      <span>To Do</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-amber-500"></div>
                      <span>In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-emerald-500"></div>
                      <span>Done</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-500"></div>
                      <span>Overdue</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Header */}
              <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timeline ({format(timelineRange.start, "MMM dd")} -{" "}
                    {format(timelineRange.end, "MMM dd")})
                  </h3>
                  <div className="text-xs text-gray-500">Red line = Today</div>
                </div>

                {/* Timeline Days */}
                <div className="flex h-6">
                  {timelineDays.map((day, index) => (
                    <div
                      key={index}
                      className={`flex-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative ${
                        isToday(day) ? "bg-red-50 dark:bg-red-950/20" : ""
                      }`}
                    >
                      {index % 7 === 0 && (
                        <div className="text-xs text-gray-500 text-center mt-1">
                          {format(day, "MMM dd")}
                        </div>
                      )}
                      {isToday(day) && (
                        <div className="absolute top-0 left-0 w-0.5 h-6 bg-red-500"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task Rows */}
            <div
              className={`space-y-1 ${isFullscreen ? "overflow-y-auto max-h-[calc(100vh-300px)]" : ""}`}
            >
              {filteredData.map((task) => (
                <Tooltip key={task.taskId}>
                  <TooltipTrigger asChild>
                    <div className="flex border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      {/* Task Info */}
                      <div className="w-80 p-4 border-r flex items-center">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate mb-2">
                            {task.taskName}
                          </h4>

                          {/* Priority, Status, Due Date in single line */}
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`text-xs ${getBadgeColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.status.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(task.dueDate, "MMM dd")}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {task.projectName}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 p-4 relative">
                        <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          {/* Task Bar */}
                          <div
                            className={`absolute top-1 h-6 rounded-md transition-all duration-300 bg-gradient-to-r ${getStatusGradient(task.status, task.isOverdue)} shadow-sm`}
                            style={{
                              left: `${task.barStart}%`,
                              width: `${task.barWidth}%`,
                            }}
                          />

                          {/* Progress Overlay */}
                          <div
                            className="absolute top-1 h-6 rounded-l-md bg-white/20 transition-all duration-300"
                            style={{
                              left: `${task.barStart}%`,
                              width: `${(task.progress / 100) * task.barWidth}%`,
                            }}
                          />

                          {/* Due Date Marker */}
                          <div
                            className="absolute top-0 w-0.5 h-8 bg-black/60"
                            style={{
                              left: `${(differenceInDays(task.dueDate, timelineRange.start) / differenceInDays(timelineRange.end, timelineRange.start)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-medium">{task.taskName}</p>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Project:</span>
                          <span>{task.projectName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{task.duration} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Due:</span>
                          <span>{format(task.dueDate, "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Progress:</span>
                          <span>{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* Task Summary */}
        <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {tasksWithDueDates.filter((t) => t.status === "TO_DO").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                To Do
              </div>
            </div>
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {
                  tasksWithDueDates.filter((t) => t.status === "IN_PROGRESS")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                In Progress
              </div>
            </div>
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">
                {tasksWithDueDates.filter((t) => t.status === "DONE").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Done
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {
                  tasksWithDueDates.filter((t) => {
                    if (!t.dueDate) return false;
                    return new Date(t.dueDate) < new Date();
                  }).length
                }
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Overdue
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TaskGanttHorizontal;
