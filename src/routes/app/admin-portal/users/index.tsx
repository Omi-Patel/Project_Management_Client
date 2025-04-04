import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getAllUsers, updateUser } from "@/lib/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import type { UserResponse } from "@/schemas/user-schema";
import { useState } from "react";
import {
  Edit,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
  UserCheck,
  UserIcon,
  UserX,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBadgeColor, getStatusColor } from "@/lib/task-utils";

export const Route = createFileRoute("/app/admin-portal/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query to fetch users
  const {
    data: users,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  // Mutation to update user
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setEditingUser(null);
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  // Mutation to delete user
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
      setUserToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  const handleEditUser = (user: UserResponse) => {
    setEditingUser({ ...user });
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      updateMutation.mutate(editingUser);
    }
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  const handleInputChange = (field: keyof UserResponse, value: string) => {
    if (editingUser) {
      setEditingUser({ ...editingUser, [field]: value });
    }
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Users</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Users List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </header>
      <Separator className="mb-4" />

      <div className="container mx-auto py-8 ">
        <div className="">
          <CardHeader className="bg-muted/10 px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <UserIcon className="h-6 w-6 text-primary" />
                  User Management
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Add, edit, and manage your platform users
                </CardDescription>
              </div>
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="sm"
                className="gap-1"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center space-x-4 animate-pulse"
                  >
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center border border-destructive/30 bg-destructive/10 text-destructive rounded-lg p-6 space-y-3 text-center">
                <X className="h-8 w-8" />
                <p className="font-medium text-lg">Failed to load users</p>
                <p className="text-sm text-destructive/70">
                  Something went wrong while fetching user data.
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </div>
            ) : users && users.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/20 transition"
                      >
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${user.role === "ADMIN" ? "bg-indigo-500" : "bg-primary"}`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`gap-1 ${getStatusColor(user.status ?? "")}`}
                          >
                            {user.status === "ACTIVE" ? (
                              <>
                                <UserCheck className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setUserToDelete(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16 border border-muted bg-muted/10 rounded-lg">
                <UserIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-lg font-semibold mt-4 text-muted-foreground">
                  No users found
                </p>
                <Button
                  variant="outline"
                  className="mt-4 gap-1"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </div>

        {/* Edit User Dialog */}
        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit User
              </DialogTitle>
              <DialogDescription>
                Update user's information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <div className="grid gap-4 py-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editingUser.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={editingUser.phoneNumber ?? ""}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) =>
                      handleInputChange("role", value as "ADMIN" | "EMPLOYEE")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingUser.status ?? ""}
                    onValueChange={(value) =>
                      handleInputChange(
                        "status",
                        value as "ACTIVE" | "INACTIVE"
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={updateMutation.isPending}
                className="gap-1"
              >
                {updateMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={(open) => !open && setUserToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Are you sure you want to delete
                this user?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-secondary hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarInset>
  );
}
