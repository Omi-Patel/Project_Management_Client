"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteTask } from "@/lib/actions"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { TaskResponse } from "@/schemas/task_schema"

interface DeleteTaskDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  task: TaskResponse | null
  onSuccess: () => void
}

export function DeleteTaskDialog({ isOpen, onOpenChange, task, onSuccess }: DeleteTaskDialogProps) {
  const queryClient = useQueryClient()

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["tasks", task?.project?.id],
      })
      toast.success("Task deleted successfully")
      onSuccess()
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to delete task. Please try again.")
    },
  })

  // Handle task deletion
  const confirmDelete = () => {
    if (task?.id) {
      deleteMutation.mutate(task.id)
    }
  }

  if (!task) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{task.title}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

