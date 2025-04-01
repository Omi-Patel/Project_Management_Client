"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { PencilIcon, TrashIcon } from "lucide-react"
import type { TaskResponse } from "@/schemas/task_schema"
import { getBadgeColor } from "@/lib/task-utils"

interface User {
  id: string
  name: string
}

interface TaskDetailsSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  task: TaskResponse | null
  assignees: User[]
  onEditClick: (task: TaskResponse) => void
  onDeleteClick: (task: TaskResponse) => void
}

export function TaskDetailsSheet({
  isOpen,
  onOpenChange,
  task,
  assignees,
  onEditClick,
  onDeleteClick,
}: TaskDetailsSheetProps) {
  if (!task) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[350px] p-6">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{task.title}</SheetTitle>
          <SheetDescription className="text-gray-600">
            {task.description || "No description available"}
          </SheetDescription>
        </SheetHeader>

        {/* Task Properties */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">State</p>
            <Badge className={`${getBadgeColor(task.status)} text-black`}>{task.status}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Priority</p>
            <Badge className={`${getBadgeColor(task.priority)} text-black`}>{task.priority}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Created At</p>
            <p className="text-sm font-medium">
              {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium">
              {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        {/* Assignees Section */}
        <div className="mt-6">
          <h3 className="text-lg font-bold">Assignees</h3>
          <TooltipProvider>
            <div className="flex mt-4">
              {assignees.length > 0 ? (
                assignees.map((assignee) => (
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
                ))
              ) : (
                <p className="text-sm text-gray-500">No assignees</p>
              )}
            </div>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onEditClick(task)}>
            <PencilIcon className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => onDeleteClick(task)}>
            <TrashIcon className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

