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
  RefreshCw,
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
import { useToast } from "@/hooks/use-toast"
import type { ConfidenceLevel } from "@/lib/types"
import { statusConfig } from "@/lib/workflow-utils"
import { typography, requirementStatusStyles, getProgressColor } from "@/lib/design-system"
import { PhysicianApprovalModal } from "@/components/physician-approval-modal"
import { PatientObjectCard } from "@/components/patient-object-card"
import { WorkflowBar } from "@/components/workflow-bar"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Import tab context - may not exist in all contexts
let useTabContext: () => { setActiveTab: (tab: string) => void } = () => ({ setActiveTab: () => {} })
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const tabModule = require("@/app/patient/[id]/page")
  if (tabModule.useTabContext) {
    useTabContext = tabModule.useTabContext
  }
} catch {
  // Tab context not available
}

function ConfidenceIndicator({ level }: { level: ConfidenceLevel }) {
  const config = {
    High: { className: "text-emerald-700 bg-emerald-50", icon: CheckCircle2 },
    Medium: { className: "text-amber-700 bg-amber-50", icon: AlertCircle },
    Low: { className: "text-red-700 bg-red-50", icon: AlertTriangle },
  }
  const { className, icon: Icon } = config[level]
  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium", className)}>
      <Icon className="h-3 w-3" />
      {level}
    </div>
  )
}

export function ClinicalSummaryView() {
  const { 
    selectedPatient, 
    regenerateSummary, 
    requestDocumentation, 
    currentRole,
    currentUser,
    claimCase,
    sendToPhysician,
    physicianApprove,
    physicianDefer,
    physicianEscalate,
    submitPA,
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
  const [showPhysicianModal, setShowPhysicianModal] = useState(false)
  const [showSendToMDSheet, setShowSendToMDSheet] = useState(false)
  const [mdNotes, setMdNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCareLensHint, setShowCareLensHint] = useState(!hasSeenSwipeHint)
  
  // Track requested items - stores rule IDs that have been requested
  const [requestedItems, setRequestedItems] = useState<Set<string>>(new Set())

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-slate-400">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No patient selected</p>
        </div>
      </div>
    )
  }

  const workflow = selectedPatient.workflow
  const statusInfo = statusConfig[workflow.status]

  const handleRegenerate = () => {
    regenerateSummary()
    toast({
      title: "Regenerating Summary",
      description: "AI is processing the latest clinical data...",
    })
  }

  const handleRequestDoc = (ruleId: string) => {
    requestDocumentation(ruleId)
    setRequestedItems(prev => new Set([...prev, ruleId]))
    toast({
      title: "Documentation Requested",
      description: "Request has been sent to the clinical team",
    })
  }

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Clinical summary is being prepared for download",
    })
  }

  const handleClaimCase = () => {
    claimCase(selectedPatient.id)
    toast({
      title: "Case Claimed",
      description: `You are now working on ${selectedPatient.name}'s case`,
    })
  }

  const handleSendToPhysician = () => {
    sendToPhysician(selectedPatient.id)
    toast({
      title: "Sent to Physician",
      description: "Case has been sent for physician review and approval",
    })
  }

  const handlePhysicianApprove = (notes?: string) => {
    physicianApprove(selectedPatient.id, notes)
    toast({
      title: "Case Approved",
      description: "Case has been approved and is ready for PA submission",
    })
  }

  const handlePhysicianDefer = (notes?: string) => {
    physicianDefer(selectedPatient.id, notes)
    toast({
      title: "Case Deferred",
      description: "Case has been sent back for additional documentation",
    })
  }

  const handlePhysicianEscalate = (notes?: string) => {
    physicianEscalate(selectedPatient.id, notes)
    toast({
      title: "Case Escalated",
      description: "Case has been escalated to Medical Director",
    })
  }

  const handleSubmitPA = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    submitPA(selectedPatient.id)
    setIsSubmitting(false)
    toast({
      title: "PA Submitted",
      description: "Prior Authorization has been submitted to the payer",
    })
  }

  const maskPHI = (value: string) => (showPHI ? value : "********")

  const isPhysician = currentRole === "physician"
  const isAuditor = currentRole === "auditor"
  const isCaseManager = currentRole === "case_manager"

  // Determine available actions based on status and role
  const canClaim = workflow.status === "new" && isCaseManager
  const canSendToPhysician = workflow.status === "in_progress" && isCaseManager
  const canPhysicianReview = workflow.status === "needs_physician" && isPhysician
  const canSubmit = workflow.status === "ready" && (isCaseManager || isPhysician)
  const isAssignedToMe = workflow.assignment?.assignedTo === currentUser.name

  // Dismiss the hint
  const dismissCareLensHint = () => {
    setShowCareLensHint(false)
    setHasSeenSwipeHint(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile CareLens Hint - shown once on first patient view */}
      {showCareLensHint && (
        <div className="md:hidden bg-purple-50 border-b border-purple-200 px-3 py-2 flex items-center justify-between">
          <p className="text-[10px] text-purple-700 flex-1">
            <strong>Tip:</strong> Swipe left or tap the brain icon to open CareLens AI analysis
          </p>
          <button 
            type="button"
            onClick={dismissCareLensHint}
            className="text-purple-400 hover:text-purple-600 ml-2 p-1"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Sticky Workflow Bar - Phase 2 */}
      <WorkflowBar 
        onRequestDocs={() => {
          // Open payer rules section and scroll into view
          setPayerRulesOpen(true)
        }}
        onSendToMD={handleSendToPhysician}
        onGeneratePA={() => setActiveTab("prior-auth")}
        onSubmit={() => setActiveTab("prior-auth")}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Patient Object Card - 3 dense rows with all info at-a-glance */}
          <PatientObjectCard 
            patient={selectedPatient}
            showPHI={showPHI}
            onTogglePHI={() => setShowPHI(!showPHI)}
          />

          {/* Alerts - Patient-impact language to reduce cognitive load */}
          {selectedPatient.alerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] text-slate-500 px-1">
                Missing items needed to authorize {selectedPatient.name.split(" ")[0]}'s care:
              </p>
              {selectedPatient.alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[11px] text-amber-800 block">{alert.message}</span>
                      <span className="text-[9px] text-amber-600 block mt-0.5">
                        Needed to meet {selectedPatient.insurance} criteria and avoid treatment delay
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-6 px-2 text-[10px] text-amber-700 hover:bg-amber-100 flex-shrink-0"
                    onClick={() => handleRequestDoc(alert.id)}
                  >
                    Request
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Problem List - Collapsible with design system typography */}
          <Collapsible open={problemListOpen} onOpenChange={setProblemListOpen}>
            <div className="bg-white rounded-lg border border-slate-100">
              <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  {problemListOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  <span className={cn(typography.sectionHeader, "text-slate-700")}>PROBLEM LIST</span>
                  <span className={typography.label}>({selectedPatient.problemList.length})</span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  {/* Primary */}
                  {selectedPatient.problemList.filter(p => p.type === "primary").map(problem => (
                    <div key={problem.id} className="flex items-center justify-between py-2 px-2.5 rounded bg-blue-50 border border-blue-100">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-medium text-slate-700">{problem.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">{problem.icdCode}</span>
                    </div>
                  ))}
                  {/* Secondary */}
                  {selectedPatient.problemList.filter(p => p.type === "secondary").map(problem => (
                    <div key={problem.id} className="flex items-center justify-between py-1.5 px-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span className="text-[11px] text-slate-600">{problem.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{problem.icdCode}</span>
                    </div>
                  ))}
                  {/* Comorbidities */}
                  {selectedPatient.problemList.filter(p => p.type === "comorbidity").length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {selectedPatient.problemList.filter(p => p.type === "comorbidity").map(problem => (
                        <span key={problem.id} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {problem.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Payer Requirements with Evidence Links - Smart defaults: unmet first */}
          <Collapsible open={payerRulesOpen} onOpenChange={setPayerRulesOpen}>
            <div className="bg-white rounded-lg border border-slate-100">
              <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  {payerRulesOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  <span className={cn(typography.sectionHeader, "text-slate-700")}>PAYER REQUIREMENTS</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                    {selectedPatient.payerRules.filter(r => r.status === "satisfied").length}/{selectedPatient.payerRules.length} met
                  </span>
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
                      // Mock linked documents based on rule
                      const linkedDocs = rule.status === "satisfied" 
                        ? ["Progress Note (Jan 7)", "Cardiology Consult"] 
                        : null
                      
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
                              <p className={cn(typography.body, "text-slate-700")}>{rule.rule}</p>
                              
                              {/* Evidence Links - Click to navigate to Evidence tab */}
                              {rule.status === "satisfied" && linkedDocs && (
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className={typography.label}>Linked:</span>
                                  {linkedDocs.map((doc, i) => (
                                    <button
                                      key={doc}
                                      type="button"
                                      className="text-[9px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                      onClick={() => setActiveTab("evidence")}
                                    >
                                      {doc}{i < linkedDocs.length - 1 ? "," : ""}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Missing doc - show request button or requested state */}
                              {rule.status === "missing" && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  {requestedItems.has(rule.id) ? (
                                    // Requested state - show confirmation
                                    <>
                                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-medium flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" />
                                        Requested
                                      </span>
                                      <span className="text-[9px] text-slate-400">Sent to clinical team</span>
                                    </>
                                  ) : (
                                    // Show request button
                                    <>
                                      <span className={cn(typography.label, "text-red-500")}>Need:</span>
                                      <span className="text-[9px] text-red-600">{rule.evidence || "Clinical documentation"}</span>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        className="h-5 px-1.5 text-[9px] text-red-600 hover:bg-red-100 ml-auto bg-transparent"
                                        onClick={() => handleRequestDoc(rule.id)}
                                      >
                                        Request
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                              
                              {/* Unclear - show what's needed */}
                              {rule.status === "unclear" && rule.evidence && (
                                <p className={cn(typography.label, "text-amber-600 mt-1")}>{rule.evidence}</p>
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

          {/* AI Summary - Collapsible with design system typography */}
          <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
            <div className="bg-white rounded-lg border border-slate-100">
              <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  {summaryOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                  <span className={cn(typography.sectionHeader, "text-slate-700")}>AI CLINICAL SUMMARY</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-[10px] text-slate-500 bg-transparent"
                  onClick={(e) => { e.stopPropagation(); handleRegenerate() }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  <div>
                    <h4 className={cn(typography.label, "mb-1")}>CHIEF COMPLAINT</h4>
                    <p className={cn(typography.body, "leading-relaxed")}>{selectedPatient.chiefComplaint}</p>
                  </div>
                  <div>
                    <h4 className={cn(typography.label, "mb-1")}>MEDICATIONS</h4>
                    <p className={cn(typography.body, "leading-relaxed")}>{selectedPatient.medications}</p>
                  </div>
                  <div>
                    <h4 className={cn(typography.label, "mb-1")}>CLINICAL COURSE</h4>
                    <p className={cn(typography.body, "leading-relaxed")}>{selectedPatient.clinicalCourse}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Timeline - Compact with design system typography */}
          <div className="bg-white rounded-lg border border-slate-100 p-3">
            <h3 className={cn(typography.sectionHeader, "text-slate-700 mb-3 flex items-center gap-2")}>
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              TIMELINE
            </h3>
            <div className="space-y-2">
              {selectedPatient.timeline.slice(0, 3).map((event, index) => (
                <div key={event.id} className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      index === 0 ? "bg-blue-500" : "bg-slate-300"
                    )} />
                    {index < 2 && <div className="w-px h-full bg-slate-200 my-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <p className="text-[11px] font-medium text-slate-700">{event.title}</p>
                    <p className="text-[9px] text-slate-400">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Footer Bar - primary actions are in WorkflowBar */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-transparent" onClick={handleExport}>
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">Export</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 bg-transparent" onClick={() => setActiveTab("evidence")}>
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">View Evidence</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <span className="text-[10px] text-slate-400">
            Updated {new Date(workflow.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Physician Approval Modal */}
      <PhysicianApprovalModal
        patient={selectedPatient}
        isOpen={showPhysicianModal}
        onClose={() => setShowPhysicianModal(false)}
        onApprove={handlePhysicianApprove}
        onDefer={handlePhysicianDefer}
        onEscalate={handlePhysicianEscalate}
      />

      {/* Send to MD Sheet - Human-centered framing */}
      <Sheet open={showSendToMDSheet} onOpenChange={setShowSendToMDSheet}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-slate-50">
            <SheetTitle className="flex items-center gap-2 text-[14px]">
              <Stethoscope className="h-4 w-4 text-purple-600" />
              Get Clinical Sign-Off for {selectedPatient.name.split(" ")[0]}
            </SheetTitle>
            <SheetDescription className="text-[11px]">
              The physician will validate medical necessity so we can move forward with {selectedPatient.name.split(" ")[0]}'s care authorization
            </SheetDescription>
          </SheetHeader>

          <div className="p-4 space-y-4">
            {/* Patient Info */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[12px] font-medium text-slate-700">{selectedPatient.name}</p>
              <p className="text-[10px] text-slate-500">{selectedPatient.diagnoses[0]}</p>
            </div>

            {/* Items Requiring MD Attention */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Items Requiring Physician Review</p>
              
              {/* High Risk Factors */}
              {selectedPatient.careLens.riskFactors.filter(r => r.status === "open").length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <p className="text-[11px] font-medium text-red-700">Risk Factors ({selectedPatient.careLens.riskFactors.filter(r => r.status === "open").length})</p>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedPatient.careLens.riskFactors.filter(r => r.status === "open").map((risk) => (
                      <li key={risk.id} className="text-[10px] text-red-600 flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                        <span>{risk.factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Policy Gaps */}
              {selectedPatient.careLens.policyGaps.filter(g => g.status === "open").length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <FileWarning className="h-3.5 w-3.5 text-amber-600" />
                    <p className="text-[11px] font-medium text-amber-700">Policy Gaps ({selectedPatient.careLens.policyGaps.filter(g => g.status === "open").length})</p>
                  </div>
                  <ul className="space-y-1.5">
                    {selectedPatient.careLens.policyGaps.filter(g => g.status === "open").map((gap) => (
                      <li key={gap.id} className="text-[10px] text-amber-600 flex items-start gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                        <span>{gap.gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Medical Necessity Items */}
              <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Stethoscope className="h-3.5 w-3.5 text-purple-600" />
                  <p className="text-[11px] font-medium text-purple-700">Physician Will Validate</p>
                </div>
                <ul className="space-y-1.5 text-[10px] text-purple-600">
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                    Medical necessity justification
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                    Treatment plan appropriateness
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-1 flex-shrink-0" />
                    Clinical documentation accuracy
                  </li>
                </ul>
              </div>
            </div>

            {/* Notes for Physician */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase">Notes for Physician (Optional)</p>
              <Textarea
                value={mdNotes}
                onChange={(e) => setMdNotes(e.target.value)}
                placeholder="Add context or specific questions for the physician..."
                className="text-[11px] min-h-[80px]"
              />
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-slate-200 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-[11px] bg-transparent"
              onClick={() => setShowSendToMDSheet(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 text-[11px] bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                handleSendToPhysician()
                setShowSendToMDSheet(false)
                setMdNotes("")
              }}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send to Physician
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
