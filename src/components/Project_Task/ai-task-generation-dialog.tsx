import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Brain,
  CheckCircle,
  FileText,
  ArrowRight,
  ListTodo,
  BarChart3,
  Settings,
  Edit3,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { generateAITasksForProject } from "@/lib/actions";
import { toast } from "sonner";
import type { ProjectSchema } from "@/schemas/project-schema";
import type { TaskResponse } from "@/schemas/task_schema";

interface AITaskGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectSchema;
  onSuccess?: () => void;
}

interface GenerationPreferences {
  complexity: "simple" | "balanced" | "detailed";
  focusArea: "development" | "design" | "testing" | "planning" | "all";
  taskCount: number;
  templateStyle: "agile" | "waterfall" | "kanban" | "custom";
  includeTimelines: boolean;
  autoAssign: boolean;
  includeSubtasks: boolean;
  includeDependencies: boolean;
  riskAssessment: boolean;
  creativityLevel: number;
  detailLevel: number;
  customInstructions: string;
}

interface ProjectInsights {
  estimatedDuration: string;
  complexity: string;
  recommendedTeamSize: number;
  riskFactors: string[];
  keyMilestones: string[];
}

interface GenerationStep {
  id: string;
  title: string;
  status: "pending" | "processing" | "completed" | "error";
  description: string;
}

export function AITaskGenerationDialog({
  isOpen,
  onOpenChange,
  project,
  onSuccess,
}: AITaskGenerationDialogProps) {
  // State management
  const [currentTab, setCurrentTab] = useState("insights");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedTasks, setGeneratedTasks] = useState<TaskResponse[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);

  // Preferences
  const [preferences, setPreferences] = useState<GenerationPreferences>({
    complexity: "balanced",
    focusArea: "all",
    taskCount: 8,
    templateStyle: "agile",
    includeTimelines: true,
    autoAssign: false,
    includeSubtasks: false,
    includeDependencies: false,
    riskAssessment: false,
    creativityLevel: 50,
    detailLevel: 70,
    customInstructions: "",
  });

  // Insights and analysis
  const [projectInsights, setProjectInsights] =
    useState<ProjectInsights | null>(null);

  // Generation steps
  const generationSteps: GenerationStep[] = [
    {
      id: "analyze",
      title: "Analyzing Project",
      description: "Understanding project scope and requirements",
      status: "pending",
    },
    {
      id: "structure",
      title: "Creating Task Structure",
      description: "Building logical task hierarchy",
      status: "pending",
    },
    {
      id: "details",
      title: "Adding Details",
      description: "Generating descriptions and priorities",
      status: "pending",
    },
    {
      id: "optimize",
      title: "Optimizing Flow",
      description: "Arranging tasks for optimal workflow",
      status: "pending",
    },
    {
      id: "finalize",
      title: "Finalizing Tasks",
      description: "Applying final touches and validation",
      status: "pending",
    },
  ];

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setCurrentTab("insights");
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentStep(0);
    setGeneratedTasks([]);
    setSelectedTasks(new Set());
    setEditingTask(null);
    setProjectInsights(null);
  };

  const handleGenerateAITasks = async () => {
    if (!project.id) return;

    try {
      setIsGenerating(true);
      setCurrentTab("generation");
      setGenerationProgress(0);
      setCurrentStep(0);

      // Simulate step-by-step generation with progress
      for (let i = 0; i < generationSteps.length; i++) {
        setCurrentStep(i);
        setGenerationProgress((i / generationSteps.length) * 80);

        // Simulate processing time for each step
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      // Actual API call with preferences
      const result = await generateAITasksForProject({
        projectId: project.id,
        complexity: preferences.complexity,
        focusArea: preferences.focusArea,
        taskCount: preferences.taskCount,
        templateStyle: preferences.templateStyle,
        includeTimelines: preferences.includeTimelines,
        autoAssign: preferences.autoAssign,
        includeSubtasks: preferences.includeSubtasks,
        includeDependencies: preferences.includeDependencies,
        riskAssessment: preferences.riskAssessment,
        creativityLevel: preferences.creativityLevel,
        detailLevel: preferences.detailLevel,
        customInstructions: preferences.customInstructions,
        projectContext: {
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          teamSize: projectInsights?.recommendedTeamSize,
        },
      });

      // Complete progress
      setGenerationProgress(100);
      setGeneratedTasks(result.generatedTasks || []);

      // Select all tasks by default
      const allTaskIds = new Set(result.generatedTasks?.map((t) => t.id) || []);
      setSelectedTasks(allTaskIds);

      // Move to preview tab
      setCurrentTab("preview");

      toast.success("Tasks generated successfully!", {
        description: `Created ${result.generatedTasks?.length || 0} intelligent tasks`,
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to generate AI tasks", {
        description:
          "Please try again or contact support if the issue persists.",
      });
      console.error("AI Task Generation Error:", error);
      setCurrentTab("insights");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTasks = async () => {
    // Apply selected tasks to the project
    const tasksToApply = generatedTasks.filter((task) =>
      selectedTasks.has(task.id)
    );

    if (tasksToApply.length === 0) {
      toast.error("Please select at least one task to apply");
      return;
    }

    // Add delay to ensure backend processing
    setTimeout(() => {
      onSuccess?.();
    }, 300);

    toast.success(`Applied ${tasksToApply.length} tasks to your project!`, {
      description: "You can now view and manage them in your task list",
      duration: 4000,
    });

    onOpenChange(false);
  };

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900">
        {/* Modern Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
                AI Task Generator
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm">
                Intelligent task generation for{" "}
                <span className="font-medium">{project.name}</span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Powered
              </Badge>
            </div>
          </div>
        </div>

        {/* Content with Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={currentTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="insights"
                  className="flex items-center gap-2 pointer-events-none"
                  disabled={currentTab !== "insights"}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex items-center gap-2 pointer-events-none"
                  disabled={currentTab !== "preferences"}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
                <TabsTrigger
                  value="generation"
                  className="flex items-center gap-2 pointer-events-none"
                  disabled={currentTab !== "generation"}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Generate</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex items-center gap-2 pointer-events-none"
                  disabled={currentTab !== "preview"}
                >
                  <ListTodo className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              {/* Project Insights Tab */}
              <TabsContent value="insights" className="p-6 space-y-6 h-full">
                <div className="max-w-2xl mx-auto">
                  {/* Project Overview */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        <FileText className="h-5 w-5" />
                        Project Overview
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          {project.name}
                        </h4>
                        {project.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {project.endDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            Due:{" "}
                            {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="p-6">
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      Task Generation Settings
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure how you want your tasks to be generated
                    </p>
                  </div>

                  {/* Main Settings */}
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Task Complexity
                          </label>
                          <Select
                            value={preferences.complexity}
                            onValueChange={(value: any) =>
                              setPreferences((prev) => ({
                                ...prev,
                                complexity: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="simple">Simple</SelectItem>
                              <SelectItem value="balanced">Balanced</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Focus Area
                          </label>
                          <Select
                            value={preferences.focusArea}
                            onValueChange={(value: any) =>
                              setPreferences((prev) => ({
                                ...prev,
                                focusArea: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Areas</SelectItem>
                              <SelectItem value="development">
                                Development
                              </SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                              <SelectItem value="planning">Planning</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Number of Tasks
                          </label>
                          <Select
                            value={preferences.taskCount.toString()}
                            onValueChange={(value) =>
                              setPreferences((prev) => ({
                                ...prev,
                                taskCount: parseInt(value),
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 tasks</SelectItem>
                              <SelectItem value="8">8 tasks</SelectItem>
                              <SelectItem value="12">12 tasks</SelectItem>
                              <SelectItem value="15">15 tasks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Timeline Option */}
                      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="timelines"
                            checked={preferences.includeTimelines}
                            onCheckedChange={(checked) =>
                              setPreferences((prev) => ({
                                ...prev,
                                includeTimelines: checked as boolean,
                              }))
                            }
                          />
                          <div>
                            <label
                              htmlFor="timelines"
                              className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
                            >
                              Include estimated timelines
                            </label>
                            <p className="text-xs text-slate-500">
                              Add time estimates to each generated task
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Generation Tab */}
              <TabsContent value="generation" className="p-6">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <Brain className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        Generating Your Tasks
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        AI is analyzing your project and creating intelligent
                        tasks
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                  </div>

                  {/* Generation Steps */}
                  <div className="space-y-4">
                    {generationSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                          index <= currentStep
                            ? "border-purple-200 bg-purple-50 dark:bg-purple-900/20"
                            : "border-slate-200 bg-slate-50 dark:bg-slate-800"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            index < currentStep
                              ? "bg-green-500 text-white"
                              : index === currentStep
                                ? "bg-purple-500 text-white"
                                : "bg-slate-300 text-slate-600"
                          }`}
                        >
                          {index < currentStep ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : index === currentStep ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <span className="text-sm font-medium">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Generated Tasks</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Review and customize your AI-generated tasks
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedTasks(
                            new Set(generatedTasks.map((t) => t.id))
                          )
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTasks(new Set())}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {generatedTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md ${
                          selectedTasks.has(task.id)
                            ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/10"
                            : ""
                        }`}
                        onClick={() => toggleTaskSelection(task.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedTasks.has(task.id)}
                              onCheckedChange={() =>
                                toggleTaskSelection(task.id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                  {task.title}
                                </h4>
                                <Badge
                                  className={`text-xs ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>

                              {task.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                {/* {task.estimatedHours && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{task.estimatedHours}h</span>
                                  </div>
                                )} */}
                                {task.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTask(
                                  editingTask === task.id ? null : task.id
                                );
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>

            {currentTab !== "insights" && currentTab !== "preview" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (currentTab === "preferences") {
                    setCurrentTab("insights");
                  } else if (currentTab === "generation") {
                    setCurrentTab("preferences");
                  }
                }}
                disabled={isGenerating}
              >
                <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentTab === "insights" && (
              <Button onClick={() => setCurrentTab("preferences")}>
                Next: Set Preferences
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {currentTab === "preferences" && (
              <Button onClick={handleGenerateAITasks} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Tasks
                  </>
                )}
              </Button>
            )}

            {currentTab === "preview" && generatedTasks.length > 0 && (
              <Button
                onClick={handleApplyTasks}
                disabled={selectedTasks.size === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Apply {selectedTasks.size} Task
                {selectedTasks.size !== 1 ? "s" : ""}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
