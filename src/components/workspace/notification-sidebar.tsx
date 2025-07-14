"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getPendingInvitations, acceptInvitation, declineInvitation } from "@/lib/workspace-actions"
import type { WorkspaceInvitationSchema } from "@/schemas/workspace-schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Bell,
  Check,
  X,
  Clock,
  Gift,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  User,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface NotificationSidebarProps {
  userId: string
  userEmail: string
}

export function NotificationSidebar({ userId, userEmail }: NotificationSidebarProps) {
  const [processingInvitation, setProcessingInvitation] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: invitations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pending-invitations", userEmail],
    queryFn: () => getPendingInvitations(userEmail),
    // enabled: open, // Only fetch when sidebar is open
  })

  const handleAcceptInvitation = async (invitation: WorkspaceInvitationSchema) => {
    try {
      setProcessingInvitation(invitation.id)
      await acceptInvitation({
        invitationId: invitation.id,
        userId: userId,
      })
      toast.success(`You've joined ${invitation.workspaceName}!`)

      // Revalidate queries
      await queryClient.invalidateQueries({ queryKey: ["pending-invitations", userEmail] })
      await queryClient.invalidateQueries({ queryKey: ["workspaces", userId] })

      // Close the sheet
      setOpen(false)
    } catch (error) {
      toast.error("Failed to accept invitation")
      console.error("Error accepting invitation:", error)
    } finally {
      setProcessingInvitation(null)
    }
  }

  const handleDeclineInvitation = async (invitation: WorkspaceInvitationSchema) => {
    try {
      setProcessingInvitation(invitation.id)
      await declineInvitation(invitation.id, userId)
      toast.success("Invitation declined")

      // Revalidate queries
      await queryClient.invalidateQueries({ queryKey: ["pending-invitations", userEmail] })
      await queryClient.invalidateQueries({ queryKey: ["workspaces", userId] })

      // Close the sheet
      setOpen(false)
    } catch (error) {
      toast.error("Failed to decline invitation")
      console.error("Error declining invitation:", error)
    } finally {
      setProcessingInvitation(null)
    }
  }

  const isExpired = (invitation: WorkspaceInvitationSchema) => {
    return new Date().getTime() > invitation.expiresAt
  }

  const activeInvitations = invitations?.filter((inv) => !isExpired(inv)) || []
  const expiredInvitations = invitations?.filter((inv) => isExpired(inv)) || []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full border shadow-sm hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
          {invitations && invitations.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {invitations.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-4">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Bell className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Notifications</span>
                {invitations && invitations.length > 0 && (
                  <Badge variant="secondary">
                    {invitations.length}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Workspace invitations</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading invitations...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="p-3 bg-destructive/10 rounded-full w-fit mx-auto">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Failed to load</h3>
                  <p className="text-sm text-muted-foreground mb-3">Please try again later</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-sm">
                You're all caught up! Check back later for new invitations.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Invitations */}
              {activeInvitations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Active Invitations</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {activeInvitations.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {activeInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{invitation.workspaceName}</h4>
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Invited by <span className="font-medium">{invitation.inviterName}</span>
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Expires {format(invitation.expiresAt, "MMM d, h:mm a")}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAcceptInvitation(invitation)}
                            disabled={processingInvitation === invitation.id}
                          >
                            <Check className="mr-2 h-3 w-3" />
                            {processingInvitation === invitation.id ? "Accepting..." : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDeclineInvitation(invitation)}
                            disabled={processingInvitation === invitation.id}
                          >
                            <X className="mr-2 h-3 w-3" />
                            {processingInvitation === invitation.id ? "Declining..." : "Decline"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expired Invitations */}
              {expiredInvitations.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Expired Invitations</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {expiredInvitations.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {expiredInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="p-4 rounded-lg border bg-muted/30 opacity-75"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">{invitation.workspaceName}</h4>
                            <p className="text-xs text-muted-foreground mb-1">
                              Invited by <span className="font-medium">{invitation.inviterName}</span>
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>Expired {format(invitation.expiresAt, "MMM d, h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
