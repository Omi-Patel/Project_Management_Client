/**
 * Returns the appropriate badge color class based on the status or priority value
 */
export function getBadgeColor(value: string): string {
  switch (value.toLowerCase()) {
    case "todo":
    case "to_do":
      return "bg-blue-200";
    case "in_progress":
      return "bg-yellow-200 ";
    case "done":
      return "bg-green-200 ";
    case "low":
      return "bg-green-200 ";
    case "medium":
      return "bg-yellow-200 ";
    case "high":
      return "bg-red-200 ";
    default:
      return "bg-gray-200 ";
  }
}
