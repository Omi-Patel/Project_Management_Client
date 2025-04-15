import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

  // Function to determine badge color based on status or priority
  export const getBadgeColor = (value: any) => {
    switch (value?.toLowerCase()) {
      case "high":
      case "urgent":
      case "overdue":
        return "bg-red-200 hover:bg-red-300"
      case "medium":
      case "in progress":
        return "bg-amber-200 hover:bg-amber-300"
      case "low":
      case "completed":
      case "done":
        return "bg-green-200 hover:bg-green-300"
      case "pending":
      case "todo":
        return "bg-blue-200 hover:bg-blue-300"
      default:
        return "bg-gray-200 hover:bg-gray-300"
    }
  }
  