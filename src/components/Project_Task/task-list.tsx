"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getTaskById, getUserById } from "@/lib/actions"
import type { TaskResponse } from "@/schemas/task_schema"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { toast } from "sonner"

import { TaskDetailsSheet } from "./task-details-sheet"
import { TaskFormDialog } from "./task-form-dialog"
import { DeleteTaskDialog } from "./delete-task-dialog"
import { TaskTable } from "./task-table"

interface User {
  id: string
  name: string
}

interface TaskListProps {
  taskIds: string[]
  projectId: string
}

export function TaskList({ taskIds, projectId }: TaskListProps) {
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [assignees, setAssignees] = useState<User[]>([])

  // Dialog states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<TaskResponse | null>(null)

  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch tasks function
  const fetchTasks = async () => {
    if (!taskIds.length) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const fetchedTasks = await Promise.all(taskIds.map((id) => getTaskById(id)))
      setTasks(fetchedTasks.filter((task) => task !== null) as TaskResponse[])
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
      toast.error("Failed to load tasks. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and when taskIds change
  useEffect(() => {
    fetchTasks()
  }, [taskIds])

  // Handle task click to show details
  const handleTaskClick = async (task: TaskResponse) => {
    setSelectedTask(task)
    setIsSheetOpen(true)

    if (task.assigneeIds && task.assigneeIds.length > 0) {
      try {
        const fetchedAssignees = await Promise.all(task.assigneeIds.map((id) => getUserById(id)))
        setAssignees(fetchedAssignees.filter((user) => user !== null) as User[])
      } catch (error) {
        console.error("Failed to fetch assignees:", error)
      }
    } else {
      setAssignees([])
    }
  }

  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation()
    setSelectedTask(task)
    setIsEditDialogOpen(true)
  }

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent, task: TaskResponse) => {
    e.stopPropagation()
    setTaskToDelete(task)
    setIsDeleteDialogOpen(true)
  }

  // Handle task update success
  const handleTaskUpdated = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
    await fetchTasks()
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
    router.invalidate()
  }

  if (loading) {
    return <p>Loading tasks...</p>
  }

  return (
    <div>
      {tasks.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No tasks found for this project</p>
        </div>
      ) : (
        <TaskTable
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      )}

      {/* Task Details Sheet */}
      <TaskDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        task={selectedTask}
        assignees={assignees}
        onEditClick={(task) => {
          setIsSheetOpen(false)
          handleEditClick(new MouseEvent("click") as any, task)
        }}
        onDeleteClick={(task) => {
          setIsSheetOpen(false)
          handleDeleteClick(new MouseEvent("click") as any, task)
        }}
      />

      {/* Task Form Dialog */}
      <TaskFormDialog
        isOpen={isEditDialogOpen || isAddDialogOpen}
        onOpenChange={(open) => {
          if (isEditDialogOpen) setIsEditDialogOpen(open)
          if (isAddDialogOpen) setIsAddDialogOpen(open)
        }}
        task={selectedTask}
        projectId={projectId}
        mode={isEditDialogOpen ? "edit" : "add"}
        onSuccess={handleTaskUpdated}
      />

      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        task={taskToDelete}
        onSuccess={async () => {
          await queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
          await fetchTasks()
          setIsDeleteDialogOpen(false)
          setTaskToDelete(null)
          router.invalidate()
        }}
      />
    </div>
  )
}

export default TaskList

