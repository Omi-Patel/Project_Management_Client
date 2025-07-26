import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Brain,
  CheckCircle,
  Clock,
  Target,
  Zap,
  FileText,
  ArrowRight,
  ListTodo,
} from "lucide-react";
import { generateAITasksForProject } from "@/lib/actions";
import { toast } from "sonner";
import type { ProjectSchema } from "@/schemas/project-schema";

interface AITaskGenerationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectSchema;
  onSuccess?: () => void;
}

export function AITaskGenerationDialog({
  isOpen,
  onOpenChange,
  project,
  onSuccess,
}: AITaskGenerationDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedTasksCount, setGeneratedTasksCount] = useState(0);

  const handleGenerateAITasks = async () => {
    if (!project.id) return;

    try {
      setIsGenerating(true);
      setIsCompleted(false);
      const result = await generateAITasksForProject(project.id);

      // Set completion state
      setIsCompleted(true);
      setGeneratedTasksCount(result.generatedTasks.length);

      toast.success(result.message, {
        description: `Generated ${result.generatedTasks.length} intelligent tasks based on your project details.`,
        duration: 4000,
      });

      // Add a small delay to ensure backend processing is complete, then refetch tasks
      setTimeout(() => {
        onSuccess?.();
      }, 500);

    } catch (error) {
      toast.error("Failed to generate AI tasks", {
        description:
          "Please try again or contact support if the issue persists.",
      });
      console.error("AI Task Generation Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewTasks = () => {
    onOpenChange(false);
    onSuccess?.();
    // Reset states
    setIsCompleted(false);
    setGeneratedTasksCount(0);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset states
    setIsCompleted(false);
    setGeneratedTasksCount(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[520px] p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 mx-auto">
        {/* Modern Header */}
        <div className="relative px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
              isCompleted 
                ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                : "bg-gradient-to-br from-purple-500 to-blue-600"
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1 leading-tight">
                {isCompleted ? "Tasks Generated Successfully!" : "AI Task Generator"}
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                {isCompleted 
                  ? `Created ${generatedTasksCount} intelligent tasks for your project`
                  : "Let AI analyze your project and create intelligent, actionable tasks to kickstart your workflow."
                }
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
          
          {/* Success State */}
          {isCompleted && (
            <div className="text-center py-4 sm:py-6 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  All Set!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your AI-generated tasks are ready. View them now to start working on your project.
                </p>
              </div>
            </div>
          )}

          {/* Project Overview - Only show when not completed */}
          {!isCompleted && (
            <>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                    Project Overview
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-tight">
                      {project.name}
                    </p>
                  </div>

                  {project.description && (
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Capabilities */}
              <div className="space-y-3 sm:space-y-4 hidden sm:block">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
                  <span>What AI Will Generate</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    {
                      icon: Target,
                      title: "Smart Breakdown",
                      description: "5-8 actionable tasks",
                      color: "text-emerald-600",
                    },
                    {
                      icon: Clock,
                      title: "Time Estimates",
                      description: "Realistic durations",
                      color: "text-blue-600",
                    },
                    {
                      icon: CheckCircle,
                      title: "Priority Levels",
                      description: "High, Medium, Low",
                      color: "text-orange-600",
                    },
                    {
                      icon: Zap,
                      title: "Ready to Start",
                      description: "Immediately actionable",
                      color: "text-purple-600",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="p-2.5 sm:p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start gap-2 sm:gap-2.5">
                        <feature.icon
                          className={`h-3 w-3 sm:h-4 sm:w-4 mt-0.5 ${feature.color} flex-shrink-0`}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-tight">
                            {feature.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info Note */}
              <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="text-xs sm:text-sm">
                  <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                    AI will analyze your project context to create relevant tasks.
                    You can edit, modify, or add more tasks after generation.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isGenerating}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 h-9 sm:h-10"
          >
            {isCompleted ? "Close" : "Cancel"}
          </Button>
          
          {isCompleted ? (
            <Button
              onClick={handleViewTasks}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-sm min-w-[120px] sm:min-w-[140px] h-9 sm:h-10"
            >
              <ListTodo className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">View Tasks</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button
              onClick={handleGenerateAITasks}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-sm min-w-[120px] sm:min-w-[140px] h-9 sm:h-10"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent mr-2" />
                  <span className="text-xs sm:text-sm">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm font-medium">Generate Tasks</span>
                  <ArrowRight className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
