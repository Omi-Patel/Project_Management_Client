/**
 * Returns the appropriate badge color class based on the status or priority value
 */
export function getBadgeColor(value: string): string {
  switch (value.toLowerCase()) {
    case "todo":
    case "to_do":
      return "bg-blue-400 text-white";
    case "in_progress":
      return "bg-yellow-400 text-white";
    case "done":
      return "bg-green-400 text-white";
    case "low":
      return "bg-green-400 text-white";
    case "medium":
      return "bg-yellow-400 text-white";
    case "high":
      return "bg-red-400 text-white";
    default:
      return "bg-gray-400 text-white";
  }
}
