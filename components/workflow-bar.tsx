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
  const { selectedPatient, currentRole, hasPermission, claimCase, currentUser } = useApp()

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
    <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Status + Progress */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
          {/* Status badge */}
          <span className={cn(
            "flex-shrink-0 text-ds-badge px-2 py-0.5 rounded-full",
            statusInfo.badgeClass
          )}>
            {statusInfo.label}
          </span>

          {/* Progress bar */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-16 sm:w-20 h-1.5 bg-[var(--neutral-150)] rounded-full overflow-hidden flex-shrink-0">
              <div 
                className={cn("h-full rounded-full transition-all", getProgressColor(progress))}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-caption text-[var(--neutral-600)] tabular-nums whitespace-nowrap">
              {progress}%
            </span>
          </div>

          {/* Issues indicator — inline on mobile */}
          {totalIssues > 0 && (
            <div className="flex items-center gap-1 text-[var(--warning)]">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span className="text-caption whitespace-nowrap">
                {totalIssues} {totalIssues === 1 ? "issue" : "issues"}
              </span>
            </div>
          )}

          {/* Assignment — hidden on mobile */}
          {workflow.assignment && (
            <span className={cn(typography.label, "hidden lg:block whitespace-nowrap")}>
              {isAssignedToMe ? "Assigned to you" : `Assigned: ${workflow.assignment.assignedTo}`}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Issues indicator button */}
          {missingRules > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 sm:px-2.5 text-caption gap-1 sm:gap-1.5 text-[var(--status-warn-text)] border-[var(--status-warn-border)] hover:bg-[var(--status-warn-bg)] bg-transparent"
              onClick={onRequestDocs}
            >
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{missingRules} Missing</span>
            </Button>
          )}

          {/* Primary action button */}
          {primaryAction && (
            <Button
              variant={primaryAction.variant}
              size="sm"
              className="h-7 px-2 sm:px-3 text-label-sm gap-1 sm:gap-1.5 font-semibold whitespace-nowrap"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              <primaryAction.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{primaryAction.label}</span>
            </Button>
          )}

          {/* More actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-[var(--neutral-400)] hover:text-foreground flex-shrink-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-body-sm" onClick={onSendToMD}>
                <UserCheck className="h-3.5 w-3.5 mr-2" />
                Send to MD Review
              </DropdownMenuItem>
              <DropdownMenuItem className="text-body-sm" onClick={onGeneratePA}>
                <FileText className="h-3.5 w-3.5 mr-2" />
                Generate PA Letter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-body-sm text-[var(--warning)]">
                <Clock className="h-3.5 w-3.5 mr-2" />
                Defer Case
              </DropdownMenuItem>
              <DropdownMenuItem className="text-body-sm text-[var(--destructive)]">
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
