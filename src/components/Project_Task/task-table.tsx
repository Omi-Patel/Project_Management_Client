"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PencilIcon, TrashIcon } from "lucide-react"
import type { TaskResponse } from "@/schemas/task_schema"
import { getBadgeColor } from "@/lib/task-utils"

interface TaskTableProps {
  tasks: TaskResponse[]
  onTaskClick: (task: TaskResponse) => void
  onEditClick: (e: React.MouseEvent, task: TaskResponse) => void
  onDeleteClick: (e: React.MouseEvent, task: TaskResponse) => void
}

export function TaskTable({ tasks, onTaskClick, onEditClick, onDeleteClick }: TaskTableProps) {
  return (
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
        {tasks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No tasks available for this project.
            </TableCell>
          </TableRow>
        ) : (
          tasks.map((task) => (
            <TableRow
              key={task.id}
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => onTaskClick(task)}
            >
              <TableCell>{task.title}</TableCell>
              <TableCell>
                <Badge className={`${getBadgeColor(task.status)} text-[11px] font-bold text-black`}>{task.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${getBadgeColor(task.priority)} text-[11px] font-bold text-black`}>{task.priority}</Badge>
              </TableCell>
              <TableCell>
                {task.assigneeIds?.length > 0 ? `${task.assigneeIds.length} user(s)` : "Unassigned"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => onEditClick(e, task)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-300 p-1 rounded-sm"
                    title="Edit Task"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => onDeleteClick(e, task)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-300 p-1 rounded-sm"
                    title="Delete Task"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

