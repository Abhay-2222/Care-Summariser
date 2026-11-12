"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  FileText,
  Search,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Send,
  UserCheck,
  Play,
  Loader2,
  Stethoscope,
  FileWarning,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { useTabContext } from "@/components/case-contexts"
import { useToast } from "@/hooks/use-toast"
import type { ConfidenceLevel } from "@/lib/types"
import { statusConfig } from "@/lib/workflow-utils"
import { typography, requirementStatusStyles, getProgressColor } from "@/lib/design-system"
import { PatientObjectCard } from "@/components/patient-object-card"
import { WorkflowBar } from "@/components/workflow-bar"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function ConfidenceIndicator({ level }: { level: ConfidenceLevel }) {
  const config = {
    High: { className: "text-[var(--status-ok-text)] bg-[var(--status-ok-bg)]", icon: CheckCircle2 },
    Medium: { className: "text-[var(--status-warn-text)] bg-[var(--status-warn-bg)]", icon: AlertCircle },
    Low: { className: "text-[var(--status-error-text)] bg-[var(--status-error-bg)]", icon: AlertTriangle },
  }
  const { className, icon: Icon } = config[level]
  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-ds-badge", className)}>
      <Icon className="h-3 w-3" />
      {level}
    </div>
  )
}

export function ClinicalSummaryView() {
  const { 
    selectedPatient, 
    requestDocumentation, 
  currentRole,
  currentUser,
  hasPermission,
  claimCase,
    sendToPhysician,
    physicianApprove,
    physicianDefer,
    physicianEscalate,
    submitPA,
    auditLog,
    hasSeenSwipeHint,
    setHasSeenSwipeHint,
    setCareLensOpen,
  } = useApp()
  const { toast } = useToast()
  const { setActiveTab } = useTabContext()
  const [showPHI, setShowPHI] = useState(true)
  
  // Smart accordions - expand sections with issues, collapse completed sections
  const hasMissingRules = selectedPatient?.payerRules?.some(r => r.status === "missing" || r.status === "unclear")
  const hasActiveProblems = selectedPatient?.problemList?.some(p => p.status === "active")
  
  const [problemListOpen, setProblemListOpen] = useState(hasActiveProblems ?? true)
  const [payerRulesOpen, setPayerRulesOpen] = useState(hasMissingRules ?? true) // Always open if issues
  const [summaryOpen, setSummaryOpen] = useState(!hasMissingRules) // Collapse if payer rules need attention
  const [showSendToMDSheet, setShowSendToMDSheet] = useState(false)
  const [mdNotes, setMdNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCareLensHint, setShowCareLensHint] = useState(!hasSeenSwipeHint)
  
  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-[var(--neutral-500)]">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="text-body-md">No patient selected</p>
        </div>
      </div>
    )
  }

  const workflow = selectedPatient.workflow
  const statusInfo = statusConfig[workflow.status]

  const requestedIds = new Set((selectedPatient.documentationRequests ?? []).map((request) => request.alertId))

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Clinical summary is being prepared for download",
    })
  }

  const handleClaimCase = () => {
    claimCase(selectedPatient.id)
  }

  const handleSendToPhysician = () => {
    sendToPhysician(selectedPatient.id)
  }

  const handleSubmitPA = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    submitPA(selectedPatient.id)
    setIsSubmitting(false)
    toast({
      title: `Sent to ${selectedPatient.insurance}`,
    })
  }

  const maskPHI = (value: string) => (showPHI ? value : "********")

  const isPhysician = currentRole === "physician"
  const isAuditor = currentRole === "auditor"
  const isCaseManager = currentRole === "case_manager"

  // Determine available actions based on status and permissions
  const canClaim = workflow.status === "new" && hasPermission("claim_case")
  const canSendToPhysician = workflow.status === "in_progress" && hasPermission("send_to_physician")
  const canPhysicianReview = workflow.status === "needs_physician" && hasPermission("approve_pa")
  const canSubmit = workflow.status === "ready" && hasPermission("submit_pa")
  const isAssignedToMe = workflow.assignment?.assignedTo === currentUser.name

  // Dismiss the hint
  const dismissCareLensHint = () => {
    setShowCareLensHint(false)
    setHasSeenSwipeHint(true)
  }

  const documentTypes = [...new Set(selectedPatient.payerRules.map((rule) => rule.evidence).filter((evidence): evidence is string => !!evidence))]
  const documentSource = documentTypes.length > 0 ? documentTypes.join(", ") : `${selectedPatient.documentsProcessed} documents on file`

  return (
    <div className="flex flex-col h-full">
      {/* Mobile CareLens Hint - shown once on first patient view */}
      {showCareLensHint && (
        <div className="md:hidden bg-[var(--status-info-bg)] border-b border-[var(--status-info-border)] px-3 py-2 flex items-center justify-between">
          <p className="text-caption text-[var(--status-info-text)] flex-1">
            Tip: Swipe left or tap the brain icon to open CareLens AI analysis
          </p>
          <button 
            type="button"
            onClick={dismissCareLensHint}
            className="focus-ring text-[var(--brand-300)] hover:text-[var(--brand-500)] ml-2 p-1"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-start justify-between gap-8">
            <PatientObjectCard
              className="min-w-0 flex-1"
              patient={selectedPatient}
              showPHI={showPHI}
              onTogglePHI={() => setShowPHI(!showPHI)}
            />
            <div className="shrink-0">
              <WorkflowBar
                onRequestDocs={() => setPayerRulesOpen(true)}
                onSendToMD={handleSendToPhysician}
                onGeneratePA={() => setActiveTab("prior-auth")}
                onSubmit={() => setActiveTab("prior-auth")}
              />
            </div>
          </div>

          {(selectedPatient.careLens.conflictingNotes.length > 0 ||
            selectedPatient.alerts.length > 0 ||
            selectedPatient.dataQuality === "sparse" ||
            (selectedPatient.activeSessions && selectedPatient.activeSessions.length > 0)) && (
            <section className="mt-8">
              <div className="flex items-baseline gap-2">
                <h3 className="text-meta text-[var(--neutral-900)]">Review issues</h3>
                <span className={typography.meta}>
                  {selectedPatient.careLens.conflictingNotes.length +
                    selectedPatient.alerts.length +
                    (selectedPatient.dataQuality === "sparse" ? 1 : 0) +
                    (selectedPatient.activeSessions && selectedPatient.activeSessions.length > 0 ? 1 : 0)}
                </span>
              </div>

              {selectedPatient.dataQuality === "sparse" && (
                <div className="mt-3">
                  <p className={typography.meta}>Chart</p>
                  <p className={cn(typography.body, "mt-1")}>
                    Only {selectedPatient.documentsProcessed} documents on file
                  </p>
                </div>
              )}

              {selectedPatient.activeSessions && selectedPatient.activeSessions.length > 0 && (
                <div className="mt-3">
                  <p className={typography.meta}>In the chart</p>
                  <p className={cn(typography.body, "mt-1")}>
                    {selectedPatient.activeSessions.map((session) => session.user).join(", ")}
                  </p>
                </div>
              )}

              {selectedPatient.careLens.conflictingNotes.length > 0 && (
                <div className="mt-3">
                  <p className={typography.meta}>Conflict</p>
                  <div className="mt-1 space-y-2">
                    {selectedPatient.careLens.conflictingNotes.map((note) => {
                      const sides = note.split(/ vs\.? /)
                      if (sides.length < 2) {
                        return (
                          <p key={note} className={typography.body}>{note}</p>
                        )
                      }
                      return (
                        <div key={note} className="flex flex-wrap items-start gap-x-4">
                          <p className={typography.body}>{sides[0]}</p>
                          <p className={cn(typography.body, "border-l border-border pl-4")}>{sides.slice(1).join(" vs ")}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedPatient.alerts.length > 0 && (
                <div className="mt-4 max-w-2xl">
                  <p className={typography.meta}>Missing</p>
                  <div className="mt-1 space-y-1 border-l-2 border-[var(--status-error-text)] pl-3">
                    {selectedPatient.alerts.map((alert) => (
                      <p key={alert.id} className={cn(typography.body, "text-[var(--status-error-text)]")}>
                        {alert.message}
                        {requestedIds.has(alert.id) && <span className={cn(typography.meta, "ml-2 text-[var(--neutral-500)]")}>Requested</span>}
                      </p>
                    ))}
                  </div>
                  {selectedPatient.alerts.some((alert) => !requestedIds.has(alert.id)) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-1 h-7 px-0 text-[var(--brand-600)]"
                      onClick={() => selectedPatient.alerts.forEach((alert) => requestDocumentation(alert.id))}
                    >
                      Request
                    </Button>
                  )}
                </div>
              )}
            </section>
          )}

          {hasPermission("view_audit_log") && (
            <div className="mt-3 space-y-1">
              {[...selectedPatient.careLens.auditTrail, ...auditLog.filter((entry) => entry.patientId === selectedPatient.id)]
                .filter((entry) =>
                  [
                    "claimed",
                    "sent for sign-off",
                    "signed off",
                    "sent back",
                    "escalated",
                    "sent to payer",
                    "approved",
                    "denied",
                    "appeal started",
                    "gap resolved",
                    "gap not applicable",
                    "documentation requested",
                    "risk addressed",
                    "risk dismissed",
                    "risk reopened",
                    "decision undone",
                  ].includes(entry.action),
                )
                .map((entry) => (
                  <p key={entry.id} className={typography.meta}>
                    {entry.action} · {entry.user} · {entry.timestamp}
                  </p>
                ))}
            </div>
          )}

          <div className="mt-8 space-y-3">
          {/* Payer Requirements with Evidence Links - Smart defaults: unmet first */}
          <Collapsible open={payerRulesOpen} onOpenChange={setPayerRulesOpen}>
            <div className="bg-card rounded-xl border border-border shadow-ds-xs">
              <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[var(--neutral-50)] transition-colors">
                <div className="flex items-center gap-2">
                  {payerRulesOpen ? <ChevronDown className="h-3.5 w-3.5 text-[var(--neutral-400)]" /> : <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />}
                  <span className={cn(typography.sectionHeader, "text-[var(--neutral-900)]")}>Requirements</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-1.5">
                  {/* Show unmet requirements first (blocking issues always visible) */}
                  {[...selectedPatient.payerRules]
                    .sort((a, b) => {
                      const priority = { missing: 0, unclear: 1, satisfied: 2 }
                      return priority[a.status] - priority[b.status]
                    })
                    .map(rule => {
                      const styles = requirementStatusStyles[rule.status]
                      const linkedDocs = rule.evidence ? [rule.evidence] : null
                      
                      return (
                        <div 
                          key={rule.id}
                          className={cn(
                            "py-2 px-2.5 rounded border",
                            styles.container
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {rule.status === "satisfied" ? (
                              <CheckCircle2 className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", styles.icon)} />
                            ) : rule.status === "missing" ? (
                              <AlertTriangle className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", styles.icon)} />
                            ) : (
                              <AlertCircle className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", styles.icon)} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={cn(typography.body, rule.status === "missing" ? "text-[var(--status-error-text)]" : "text-foreground")}>{rule.rule}</p>
                              
                              {/* Evidence Links - Click to navigate to Evidence tab */}
                              {rule.status === "satisfied" && linkedDocs && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className={typography.label}>Linked:</span>
                                  {linkedDocs.map((doc, i) => (
                                    <button
                                      key={doc}
                                      type="button"
                                      className="focus-ring text-caption text-[var(--brand-500)] hover:text-[var(--brand-700)] hover:underline cursor-pointer"
                                      onClick={() => setActiveTab("evidence")}
                                    >
                                      {doc}{i < linkedDocs.length - 1 ? "," : ""}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Missing doc - show request button or requested state */}
                              {/* Unclear - show what's needed */}
                              {rule.status === "unclear" && rule.evidence && (
                                <p className={cn(typography.label, "text-[var(--warning)] mt-1")}>{rule.evidence}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Problem List */}
          <Collapsible open={problemListOpen} onOpenChange={setProblemListOpen}>
            <div className="bg-card rounded-xl border border-border shadow-ds-xs">
              <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[var(--neutral-50)] transition-colors">
                <div className="flex items-center gap-2">
                  {problemListOpen ? <ChevronDown className="h-3.5 w-3.5 text-[var(--neutral-400)]" /> : <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />}
                  <span className={cn(typography.sectionHeader, "text-[var(--neutral-900)]")}>Problem list</span>
                  <span className={typography.label}>({selectedPatient.problemList.length})</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  {/* Primary */}
                  {selectedPatient.problemList.filter(p => p.type === "primary").map(problem => (
                    <div key={problem.id} className="flex items-center justify-between py-2 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[var(--brand-500)]" />
                        <span className={typography.body}>{problem.name}</span>
                      </div>
                      <span className={typography.meta}>{problem.icdCode}</span>
                    </div>
                  ))}
                  {/* Secondary */}
                  {selectedPatient.problemList.filter(p => p.type === "secondary").map(problem => (
                    <div key={problem.id} className="flex items-center justify-between py-1.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-400)]" />
                        <span className={typography.body}>{problem.name}</span>
                      </div>
                              <span className={typography.meta}>{problem.icdCode}</span>
                    </div>
                  ))}
                  {/* Comorbidities */}
                  {selectedPatient.problemList.filter(p => p.type === "comorbidity").length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                      {selectedPatient.problemList.filter(p => p.type === "comorbidity").map(problem => (
                        <span key={problem.id} className={typography.meta}>
                          {problem.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* AI Summary - Collapsible with design system typography */}
          <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
            <div className="bg-card rounded-xl border border-border shadow-ds-xs">
              <div className="relative flex items-center">
                <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[var(--neutral-50)] transition-colors">
                  <div className="flex items-center gap-2">
                    {summaryOpen ? <ChevronDown className="h-3.5 w-3.5 text-[var(--neutral-400)]" /> : <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />}
                    <span className={cn(typography.sectionHeader, "text-[var(--neutral-900)]")}>
                      Summary · CareLens suggests, from {selectedPatient.documentsProcessed} documents
                    </span>
                  </div>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  <p className={typography.meta}>From: {documentSource}</p>
                  <p className={typography.meta}>Demo data</p>
                  <div>
                    <h4 className={cn(typography.label, "mb-1")}>Chief complaint</h4>
                    <p className={cn(typography.body, "leading-relaxed")}>{selectedPatient.chiefComplaint}</p>
                  </div>
                  <div>
                    <h4 className={cn(typography.meta, "mb-1")}>Medications</h4>
                    <p className={cn(typography.body, "leading-relaxed")}>{selectedPatient.medications}</p>
                  </div>
                  <div>
                    <h4 className={cn(typography.meta, "mb-1")}>Clinical course</h4>
                    <p className={cn(typography.body, "leading-relaxed")}>{selectedPatient.clinicalCourse}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Timeline - Compact with design system typography */}
          <div className="bg-card rounded-xl border border-border p-3 shadow-ds-xs">
            <h3 className={cn(typography.sectionHeader, "mb-3 flex items-center gap-2 text-[var(--neutral-900)]")}>
              <Clock className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
              Timeline
            </h3>
            <div className="flex flex-col gap-2">
              {selectedPatient.timeline.slice(0, 3).map((event, index) => (
                <div key={event.id} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      index === 0 ? "bg-[var(--brand-500)]" : "bg-[var(--neutral-300)]"
                    )} />
                    {index < 2 && <div className="w-px h-full bg-[var(--neutral-200)] my-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <p className={typography.body}>{event.title}</p>
                    <p className={typography.meta}>{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer Bar - primary actions are in WorkflowBar */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-border bg-[var(--neutral-50)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-transparent" aria-label="Download summary" onClick={handleExport}>
                    <Download className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-caption">Export</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-transparent" aria-label="Search evidence" onClick={() => setActiveTab("evidence")}>
                    <Search className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-caption">View Evidence</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <span className="text-caption text-[var(--neutral-500)]">
            Updated {new Date(workflow.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Send for sign-off */}
      <Sheet open={showSendToMDSheet} onOpenChange={setShowSendToMDSheet}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b border-border bg-[var(--status-info-bg)]">
            <SheetTitle className="flex items-center gap-2 text-body-md">
              <Stethoscope className="h-4 w-4 text-[var(--brand-500)]" />
              Send for sign-off
            </SheetTitle>
            <SheetDescription className="text-caption text-[var(--neutral-600)]">
              {selectedPatient.name}
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-4">
            {/* Patient Info */}
            <div className="p-3 rounded-lg bg-[var(--neutral-50)] border border-border">
              <p className="text-label-md text-foreground">{selectedPatient.name}</p>
              <p className="text-caption text-[var(--neutral-600)]">{selectedPatient.diagnoses[0]}</p>
            </div>

            {/* Items Requiring MD Attention */}
            <div className="space-y-3">
              <p className="text-overline text-[var(--neutral-600)]">Items Requiring Physician Review</p>
              
              {/* High Risk Factors */}
              {selectedPatient.careLens.riskFactors.filter(r => r.status === "open").length > 0 && (
                <div className="p-3 rounded-lg bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--destructive)]" />
                    <p className="text-label-sm text-[var(--status-error-text)]">Risk Factors ({selectedPatient.careLens.riskFactors.filter(r => r.status === "open").length})</p>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedPatient.careLens.riskFactors.filter(r => r.status === "open").map((risk) => (
                      <li key={risk.id} className="text-caption text-[var(--status-error-text)] flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--destructive)] mt-1 flex-shrink-0" />
                        <span>{risk.factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Policy Gaps */}
              {selectedPatient.careLens.policyGaps.filter(g => g.status === "open").length > 0 && (
                <div className="p-3 rounded-lg bg-[var(--status-warn-bg)] border border-[var(--status-warn-border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <FileWarning className="h-3.5 w-3.5 text-[var(--warning)]" />
                    <p className="text-label-sm text-[var(--status-warn-text)]">Policy Gaps ({selectedPatient.careLens.policyGaps.filter(g => g.status === "open").length})</p>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedPatient.careLens.policyGaps.filter(g => g.status === "open").map((gap) => (
                      <li key={gap.id} className="text-caption text-[var(--status-warn-text)] flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)] mt-1 flex-shrink-0" />
                        <span>{gap.gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Notes for Physician */}
            <div className="space-y-2">
              <p className="text-overline text-[var(--neutral-600)]">Notes for Physician (Optional)</p>
              <Textarea
                value={mdNotes}
                onChange={(e) => setMdNotes(e.target.value)}
                placeholder="Add context or specific questions for the physician..."
                className="text-caption min-h-[80px]"
              />
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-border flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-label-sm bg-transparent"
              onClick={() => setShowSendToMDSheet(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 text-label-sm bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white"
              onClick={() => {
                handleSendToPhysician()
                setShowSendToMDSheet(false)
                setMdNotes("")
              }}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send for sign-off
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
