"use client"

import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { statusConfig } from "@/lib/workflow-utils"
import { typography, getProgressColor } from "@/lib/design-system"
import { cn } from "@/lib/utils"
import { 
  Play, 
  Send, 
  UserCheck, 
  CheckCircle2, 
  ChevronDown,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WorkflowBarProps {
  onRequestDocs?: () => void
  onSendToMD?: () => void
  onGeneratePA?: () => void
  onSubmit?: () => void
}

export function WorkflowBar({ 
  onRequestDocs, 
  onSendToMD, 
  onGeneratePA, 
  onSubmit 
}: WorkflowBarProps) {
  const { selectedPatient, currentRole, claimCase, currentUser } = useApp()

  if (!selectedPatient) return null

  const workflow = selectedPatient.workflow
  const statusInfo = statusConfig[workflow.status]
  const progress = workflow.progressPercent
  const isAssignedToMe = workflow.assignment?.assignedTo === currentUser

  // Determine primary action based on status
  const getPrimaryAction = () => {
    if (workflow.status === "new" && !isAssignedToMe) {
      return {
        label: "Claim Case",
        icon: Play,
        onClick: () => claimCase(selectedPatient.id),
        variant: "default" as const,
      }
    }
    if (workflow.status === "in_progress" && workflow.readyForPA) {
      return {
        label: "Generate PA",
        icon: FileText,
        onClick: onGeneratePA,
        variant: "default" as const,
      }
    }
    if (workflow.status === "needs_physician") {
      return {
        label: "Awaiting MD",
        icon: Clock,
        onClick: undefined,
        variant: "secondary" as const,
        disabled: true,
      }
    }
    if (workflow.status === "ready") {
      return {
        label: "Submit PA",
        icon: Send,
        onClick: onSubmit,
        variant: "default" as const,
      }
    }
    if (workflow.status === "in_progress") {
      return {
        label: "Send to MD",
        icon: UserCheck,
        onClick: onSendToMD,
        variant: "outline" as const,
      }
    }
    return null
  }

  const primaryAction = getPrimaryAction()

  // Count issues that need attention
  const openGaps = selectedPatient.careLens?.policyGaps?.filter(g => g.status === "open").length || 0
  const missingRules = selectedPatient.payerRules?.filter(r => r.status === "missing").length || 0
  const totalIssues = openGaps + missingRules

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Status + Progress */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Status badge */}
          <span className={cn(
            "flex-shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full",
            statusInfo.badgeClass
          )}>
            {statusInfo.label}
          </span>

          {/* Progress bar */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all", getProgressColor(progress))}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={cn(typography.label, "tabular-nums whitespace-nowrap")}>
              {progress}% complete
            </span>
          </div>

          {/* Issues indicator */}
          {totalIssues > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-[10px] font-medium">
                {totalIssues} {totalIssues === 1 ? "issue" : "issues"}
              </span>
            </div>
          )}

          {/* Assignment */}
          {workflow.assignment && (
            <span className={cn(typography.label, "hidden md:block")}>
              {isAssignedToMe ? "Assigned to you" : `Assigned: ${workflow.assignment.assignedTo}`}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Issues indicator button - navigates to payer requirements section */}
          {missingRules > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-[11px] gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50 bg-transparent"
              onClick={onRequestDocs}
            >
              <AlertTriangle className="h-3 w-3" />
              <span className="hidden sm:inline">{missingRules} Missing</span>
              <span className="sm:hidden">{missingRules}</span>
            </Button>
          )}

          {/* Primary action button */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant}
              size="sm"
              className="h-7 px-3 text-[11px] gap-1.5 font-medium"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              <primaryAction.icon className="h-3.5 w-3.5" />
              {primaryAction.label}
            </Button>
          )}

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-[11px]" onClick={onSendToMD}>
                <UserCheck className="h-3.5 w-3.5 mr-2" />
                Send to MD Review
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px]" onClick={onGeneratePA}>
                <FileText className="h-3.5 w-3.5 mr-2" />
                Generate PA Letter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[11px] text-amber-600">
                <Clock className="h-3.5 w-3.5 mr-2" />
                Defer Case
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[11px] text-red-600">
                <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                Escalate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
