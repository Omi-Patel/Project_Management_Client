import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/actions";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { LoadingScreen } from "@/components/LoadingScreen";
import { ProjectSchema } from "@/schemas/project-schema";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/projects/")({
  component: RouteComponent,
  loader: async () => {
    const projects = await getAllProjects();
    return projects as ProjectSchema[];
  },
  pendingComponent: () => {
    return <LoadingScreen />;
  },
});

function RouteComponent() {
  const projects = Route.useLoaderData();
  

  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectSchema | null>(
    null
  );
  const [projectToDelete, setProjectToDelete] = useState<ProjectSchema | null>(
    null
  );
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();

  const form = useForm<ProjectSchema>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      id: selectedProject?.id,
      name: selectedProject?.name || "",
      description: selectedProject?.description || "",
      startDate: selectedProject?.startDate || null,
      endDate: selectedProject?.endDate || null,
    },
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projects", replace: true });
      setOpen(false);
      toast.success("Project created successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create project. Please try again.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projects", replace: true });
      setOpen(false);
      toast.success("Project updated successfully");
      router.invalidate();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update project. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/app/projects", replace: true });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      toast.success("Project deleted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete project. Please try again.");
    },
  });

  const onSubmit = (data: ProjectSchema) => {
    if (data.id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddClick = () => {
    setSelectedProject(null);
    form.reset({
      id: null,
      name: "",
      description: "",
      startDate: null,
      endDate: null,
    });
    setOpen(true);
  };

  const handleEditClick = (project: ProjectSchema) => {
    setSelectedProject(project);
    form.reset(project);
    setOpen(true);
  };

  const handleDeleteClick = (project: ProjectSchema) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete?.id) {
      deleteMutation.mutate(projectToDelete.id);
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
                  <BreadcrumbLink href="#">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Projects List</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button onClick={handleAddClick} className="cursor-pointer">
            <PlusIcon className="size-3 mr-1" />
            Add
          </Button>
        </div>
      </header>
      <Separator className="mb-4" />
      <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col justify-between border  shadow-md rounded-lg hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() =>
              navigate({ to: `/app/projects/${project.id}` })
            }
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                {project.name}
              </CardTitle>
              <CardDescription className="text-[16px] py-2 my-2">
                {project.description || "No description available"}
              </CardDescription>
              {/* <div className="text-sm text-gray-600 mt-2">
                <p>
                  <strong>Start Date:</strong>{" "}
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div> */}
            </CardHeader>
            <div className="flex-grow"></div>
            <CardFooter className="flex justify-end gap-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from triggering
                  handleEditClick(project);
                }}
              >
                <PencilIcon className="size-4" /> Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click from triggering
                  handleDeleteClick(project);
                }}
              >
                <Trash2Icon className="size-4" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedProject ? "Edit Project" : "Add Project"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("Validation errors:", errors); // Debug log
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project name"
                        {...field}
                        value={field.value || ""}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project description"
                        {...field}
                        value={field.value || ""}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}
