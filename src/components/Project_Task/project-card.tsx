import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderKanbanIcon,
  ClockIcon,
  CalendarDaysIcon,
  MoreVertical,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
  project: any;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
  onClick?: (project: any) => void;
  showActions?: boolean;
  canEdit?: boolean;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
  canEdit = false,
}: ProjectCardProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  return (
    <div
      className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm rounded-xl flex flex-col h-full"
      onClick={() => onClick?.(project)}
    >
      {/* Project Color Accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: project.color || "#3B82F6" }}
      ></div>

      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-10">
        {project.startDate && project.endDate && (
          <Badge
            variant="secondary"
            className={`px-3 text-xs font-medium shadow-sm ${(() => {
              const endDate = new Date(project.endDate);
              endDate.setHours(0, 0, 0, 0);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const daysRemaining = Math.ceil(
                (endDate.getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return daysRemaining < 0
                ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                : daysRemaining <= 3
                  ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                  : daysRemaining <= 7
                    ? "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
            })()}`}
          >
            {(() => {
              const endDate = new Date(project.endDate);
              endDate.setHours(0, 0, 0, 0);

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const daysRemaining = Math.ceil(
                (endDate.getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return daysRemaining < 0
                ? `${Math.abs(daysRemaining)} days overdue`
                : daysRemaining === 0
                  ? "Due today!"
                  : daysRemaining === 1
                    ? "Due tomorrow"
                    : `${daysRemaining} days remaining`;
            })()}
          </Badge>
        )}
      </div>

      {/* Actions Dropdown */}
      {showActions && canEdit && (
        <div className="absolute top-4 right-4 z-20 ">
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full shadow-sm border"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Project Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
              className="w-48"
            >
              <DropdownMenuItem
                onSelect={() => onEdit?.(project)}
                className="cursor-pointer"
              >
                <PencilIcon className="mr-2 h-4 w-4" />
                <span>Edit Project</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onSelect={() => onDelete?.(project)}
              >
                <Trash2Icon className="mr-2 h-4 w-4" />
                <span>Delete Project</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col gap-6 mt-10">
        {/* Project Header */}
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl shadow-sm border-2 border-white/50 flex-shrink-0"
            style={{
              backgroundColor: `${project.color || "#3B82F6"}20`,
            }}
          >
            <FolderKanbanIcon
              className="w-6 h-6"
              style={{ color: project.color || "#3B82F6" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 line-clamp-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed min-h-[40px]">
              {project.description || "No description available."}
            </p>
          </div>
        </div>

        {/* Project Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-3 h-3" />
              <span>Start Date</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(project.startDate)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-3 h-3" />
              <span>End Date</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(project.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, ${project.color || "#3B82F6"}15, ${project.color || "#3B82F6"}08)`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: project.color || "#3B82F6",
            }}
          ></div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Created {formatDate(project.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Click to view
          </span>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
} 