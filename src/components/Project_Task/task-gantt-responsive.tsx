"use client";

import { useEffect, useState } from "react";
import TaskGanttHorizontal from "./task-gantt-horizontal";
import TaskGanttMobile from "./task-gantt-mobile";
import type { TaskResponse } from "@/schemas/task_schema";

interface TaskGanttResponsiveProps {
  tasks: TaskResponse[];
  projectId?: string;
}

const TaskGanttResponsive = ({
  tasks,
  projectId,
}: TaskGanttResponsiveProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      // More responsive breakpoints
      const width = window.innerWidth;
      if (width < 640) {
        // sm breakpoint
        setIsMobile(true);
      } else if (width < 1024) {
        // lg breakpoint - tablet
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    // Check on mount
    checkScreenSize();

    // Add event listener
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Show mobile version on small screens
  if (isMobile) {
    return <TaskGanttMobile tasks={tasks} projectId={projectId} />;
  }

  // Show desktop version on larger screens
  return <TaskGanttHorizontal tasks={tasks} projectId={projectId} />;
};

export default TaskGanttResponsive;
