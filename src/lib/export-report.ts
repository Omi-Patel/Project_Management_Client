import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { TaskResponse } from "@/schemas/task_schema";

export interface User {
  id: string;
  name: string;
  [key: string]: any; // For any additional properties
}

/**
 * Formats a date for Excel export
 */
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "";
  try {
    return format(new Date(date), "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Exports tasks to Excel format with assignee information
 * @param tasks List of tasks to export
 * @param assignees List of all users for resolving assignee names
 * @param fileName Base name for the export file
 */
export const exportTasksToExcel = (
  tasks: TaskResponse[],
  assignees: User[],
  fileName: string = "tasks-export"
): void => {
  // Add timestamp to filename for uniqueness
  const timestamp = format(new Date(), "yyyy-MM-dd-HHmmss");
  const finalFileName = `${fileName}-${timestamp}.xlsx`;

  // Map assignee IDs to names for each task
  const excelData = tasks.map((task) => {
    // Get assignee names from IDs
    const assigneeNames = task.assigneeIds
      ? task.assigneeIds
          .map(
            (id) => assignees.find((user) => user.id === id)?.name || "Unknown"
          )
          .join(", ")
      : "";

    return {
      "Task ID": task.id,
      Title: task.title || "",
      Description: task.description || "",
      Status: task.status || "",
      Priority: task.priority || "",
      Project: task.project.name || "",
      Assignees: assigneeNames,
      "Due Date": formatDate(task.dueDate ?? ""),
      "Created At": formatDate(
        task.createdAt ? new Date(task.createdAt) : undefined
      ),
      "Updated At": formatDate(
        task.updatedAt ? new Date(task.updatedAt) : undefined
      ),
    };
  });

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Task ID
    { wch: 40 }, // Title
    { wch: 60 }, // Description
    { wch: 15 }, // Status
    { wch: 15 }, // Priority
    { wch: 25 }, // Project
    { wch: 30 }, // Assignees
    { wch: 15 }, // Due Date
    { wch: 15 }, // Created At
    { wch: 15 }, // Updated At
  ];

  worksheet["!cols"] = columnWidths;

  // Create workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, finalFileName);
};
