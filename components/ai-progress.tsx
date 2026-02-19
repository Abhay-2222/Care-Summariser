"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Brain, 
  FileSearch, 
  Shield, 
  CheckCircle2,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface AIProgressStep {
  id: string
  label: string
  icon: typeof Brain
  status: "pending" | "active" | "complete" | "error"
}

interface AIProgressProps {
  isActive: boolean
  currentStep?: string
  steps?: AIProgressStep[]
  className?: string
}

const defaultSteps: AIProgressStep[] = [
  { id: "extract", label: "Extracting clinical data", icon: FileSearch, status: "pending" },
  { id: "analyze", label: "Analyzing documentation", icon: Brain, status: "pending" },
  { id: "validate", label: "Validating against policy", icon: Shield, status: "pending" },
  { id: "complete", label: "Generating summary", icon: CheckCircle2, status: "pending" },
]

export function AIProgress({ isActive, currentStep, steps = defaultSteps, className }: AIProgressProps) {
  const [progress, setProgress] = useState(0)
  const [activeStepIndex, setActiveStepIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      setActiveStepIndex(0)
      return
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isActive])

  useEffect(() => {
    // Update step based on progress
    const stepProgress = Math.floor((progress / 100) * steps.length)
    setActiveStepIndex(Math.min(stepProgress, steps.length - 1))
  }, [progress, steps.length])

  if (!isActive && progress === 0) return null

  const currentStepData = steps[activeStepIndex]
  const Icon = currentStepData?.icon || Brain

  return (
    <div className={cn(
      "rounded-xl border border-primary/20 bg-primary/5 p-4",
      className
    )}>
      {/* Current action indicator (Heuristic #1) */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            {progress < 100 ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {progress < 100 ? currentStepData?.label : "Analysis complete"}
          </p>
          <p className="text-xs text-muted-foreground">
            {progress < 100 ? "AI is processing..." : "Ready for review"}
          </p>
        </div>
        <span className="text-sm font-mono font-medium text-primary">
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1.5 mb-3" />

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const StepIcon = step.icon
          const isActive = idx === activeStepIndex && progress < 100
          const isComplete = idx < activeStepIndex || progress === 100
          
          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center gap-1"
            >
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                isComplete && "bg-emerald-100 text-[var(--success)]",
                isActive && "bg-primary/10 text-primary",
                !isComplete && !isActive && "bg-muted text-muted-foreground"
              )}>
                {isActive ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isComplete ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <span className={cn(
                "text-2xs text-center max-w-[60px]",
                isActive && "text-primary font-medium",
                isComplete && "text-[var(--success)]",
                !isActive && !isComplete && "text-muted-foreground"
              )}>
                {step.label.split(" ")[0]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Compact inline progress for smaller spaces
export function AIProgressInline({ isActive, label }: { isActive: boolean; label?: string }) {
  if (!isActive) return null

  return (
    <div className="flex items-center gap-2 text-xs text-primary">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{label || "Processing..."}</span>
    </div>
  )
}
