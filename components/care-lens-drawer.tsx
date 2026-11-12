"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Brain,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  FileWarning,
  Lightbulb,
  X,
  MessageSquare,
  Check,
  Loader2,
  Send,
  Zap,
  FileText,
  RefreshCw,
  Download,
  HelpCircle,
  Target,
} from "lucide-react"
import { useApp } from "@/lib/app-context"
import { rulesMet } from "@/lib/workflow-utils"
import type { RiskLevel } from "@/lib/types"
import { riskStyles } from "@/lib/design-system"

interface CareLensDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: "full" | "readonly"
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-ds-badge", riskStyles[level])}>
      {level}
    </span>
  )
}

interface QuickAction {
  id: string
  label: string
  icon?: React.ReactNode
  action: () => void
}

function ChatMessage({ 
  role, 
  content, 
  isLoading, 
  quickActions,
}: { 
  role: "user" | "assistant" | "coach"
  content: string
  isLoading?: boolean
  quickActions?: QuickAction[]
  userName?: string
}) {
  const isAssistant = role === "coach" || role === "assistant"
  return (
    <div className={cn("flex gap-2", role === "user" ? "justify-end" : "justify-start")}>
      {isAssistant && (
        <div className="h-5 w-5 rounded-full bg-[var(--neutral-100)] border border-[var(--neutral-200)] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Brain className="h-3 w-3 text-[var(--brand-500)]" />
        </div>
      )}
      <div className={cn(
        "max-w-[85%] rounded-lg text-caption leading-relaxed",
        role === "user"
          ? "bg-[var(--brand-700)] text-white px-2.5 py-1.5"
          : "bg-[var(--neutral-100)] border border-[var(--neutral-200)] text-[var(--neutral-800)]"
      )}>
        {isLoading ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <Loader2 className="h-3 w-3 animate-spin text-[var(--neutral-500)]" />
            <span className="text-[var(--neutral-600)]">Analyzing...</span>
          </div>
        ) : (
          <div>
            <div className="px-2.5 py-1.5 whitespace-pre-wrap">{content}</div>
            {quickActions && quickActions.length > 0 && (
              <div className="flex flex-wrap gap-1 px-2.5 pb-1.5 pt-1 border-t border-[var(--neutral-200)]">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="focus-ring flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-[var(--neutral-300)] hover:bg-[var(--neutral-50)] text-[var(--neutral-700)] text-caption transition-colors"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface CoachMessage {
  role: "user" | "assistant" | "coach"
  content: string
  quickActions?: QuickAction[]
}

export function CareLensDrawer({ isOpen, onClose, mode }: CareLensDrawerProps) {
  const { selectedPatient, currentRole, hasPermission, updateRiskFactorStatus, updateRecommendationStatus, logAction } = useApp()
  const [confidenceOpen, setConfidenceOpen] = useState(true)
  const [risksOpen, setRisksOpen] = useState(true)
  const [gapsOpen, setGapsOpen] = useState(true)
  const [recsOpen, setRecsOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState<CoachMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])
  
  const patientKey = selectedPatient?.id ?? ""
  const [chatKey, setChatKey] = useState(patientKey)
  if (chatKey !== patientKey) {
    setChatKey(patientKey)
    setHasGreeted(false)
    setChatMessages([])
  } else if (isOpen && selectedPatient && !hasGreeted && mode === "full") {
    const { careLens } = selectedPatient
    const openRisks = careLens.riskFactors.filter((risk) => risk.status === "open")
    const openGaps = careLens.policyGaps.filter((gap) => gap.status === "open")
    const caseLine = selectedPatient.diagnoses[0]
      ? `${selectedPatient.name}: ${selectedPatient.diagnoses[0]}`
      : selectedPatient.name
    const detail = openRisks.length > 0 && openRisks[0].severity === "High"
      ? `${openRisks.length} risk${openRisks.length > 1 ? "s" : ""} flagged. Top issue: ${openRisks[0].factor}`
      : openGaps.length > 0
        ? `${openGaps.length} policy gap${openGaps.length > 1 ? "s" : ""} to address before submission.`
        : `Case looks ready. All criteria met for ${selectedPatient.insurance}.`
    const greeting = `${caseLine}. ${detail}`
    setHasGreeted(true)
    setChatMessages([{ role: "assistant", content: greeting }])
  }

  if (!selectedPatient) return null

  const { careLens } = selectedPatient
  const isInteractive = mode === "full"
  
  const openRiskCount = careLens.riskFactors.filter(r => r.status === "open").length
  const openGapCount = careLens.policyGaps.filter(g => g.status === "open").length
  const pendingRecCount = careLens.recommendations.filter(r => r.status === "pending").length

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase()
    const met = rulesMet(selectedPatient)
    const record = `${met} of ${selectedPatient.payerRules.length} requirements met. ${selectedPatient.documentsProcessed} documents on file. ${careLens.conflictingNotes.length} conflicting notes. Denial risk on the record is ${careLens.denialRisk}.`
    if (q.includes("los") || q.includes("length of stay")) {
      return selectedPatient.lengthOfStay
        ? `Length of stay on the record is ${selectedPatient.lengthOfStay}. The record does not include a frailty score or a similar-case average.`
        : "The record does not include a length of stay. Check the admission note."
    }
    if (q.includes("deny") || q.includes("denial") || q.includes("confidence") || q.includes("score")) {
      return record
    }
    if (q.includes("override") || q.includes("challenge")) {
      return "Addressed and Dismiss update this case and are written to the audit log. There is no Challenge action."
    }
    if (selectedPatient.diagnoses[0]) {
      return `${selectedPatient.name}: ${selectedPatient.diagnoses[0]}. ${record}`
    }
    return "The record does not have an answer to that. Check the notes on this case."
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    const userMessage = chatInput.trim()
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setChatInput("")
    setIsTyping(true)
    
    setTimeout(() => {
      const response = getAIResponse(userMessage)
      setChatMessages(prev => [...prev, { role: "assistant", content: response }])
      setIsTyping(false)
    }, 1200)
  }

  const handleQuickAction = (actionType: string) => {
    setIsTyping(true)
    let response = ""
    const followUpActions: QuickAction[] = []
    
    switch (actionType) {
      case "draft_request":
        response = `CareLens suggests a note, not a sent request: consult for ${selectedPatient.diagnoses[0] || "this case"} to meet ${selectedPatient.insurance} criteria. Nothing has been sent.`
        break
      case "show_criteria": {
        const lines = selectedPatient.payerRules.map((rule, index) => `${index + 1}. ${rule.rule} (${rule.status})`).join("\n")
        response = lines
          ? `Requirements on this case:\n\n${lines}`
          : "This case has no payer requirements on the record."
        break
      }
      case "similar_cases":
        response = "The record does not include similar cases or their outcomes."
        break
      case "address_gaps": {
        const open = careLens.policyGaps.filter((gap) => gap.status === "open")
        response = open.length
          ? `Open gaps on this case:\n\n${open.map((gap, index) => `${index + 1}. ${gap.gap}`).join("\n")}`
          : "This case has no open policy gaps."
        break
      }
      case "generate_pa":
        response = `The request draft is on the Request tab. It starts from ${selectedPatient.diagnoses[0] || "the diagnosis"} and the clinical course on this case. CareLens has not generated a separate document.`
        break
      case "confirm_send":
        response = "Nothing was sent and no recommendation was changed. That action is a suggestion only."
        break
      case "apply_pattern":
        logAction("suggestion saved", selectedPatient.id)
        response = "Nothing was sent and no recommendation was changed. That action is a suggestion only."
        break
      default:
        response = `The record for ${selectedPatient.name} does not have an answer to that. Check the notes on this case.`
    }
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: "coach", 
        content: response,
        quickActions: followUpActions.length > 0 ? followUpActions : undefined
      }])
      setIsTyping(false)
    }, 800)
  }

  const roleViews = {
    case_manager: {
      title: "CareLens Coach",
      subtitle: "CareLens suggests",
      badgeColor: "bg-[var(--status-info-bg)] text-[var(--brand-500)] border-[var(--status-info-border)]",
      showChat: true,
      showActions: true,
      showExport: false,
    },
    physician: {
      title: "Clinical Review",
      subtitle: "Read-Only Analysis",
      badgeColor: "bg-[var(--status-info-bg)] text-[var(--brand-500)] border-[var(--status-info-border)]",
      showChat: false,
      showActions: false,
      showExport: false,
    },
    auditor: {
      title: "Compliance Report",
      subtitle: "Audit & Export",
      badgeColor: "bg-[var(--status-ok-bg)] text-[var(--success)] border-[var(--status-ok-border)]",
      showChat: false,
      showActions: false,
      showExport: true,
    },
  }
  const roleView = roleViews[currentRole]

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[360px] max-w-full p-0 flex flex-col h-full overflow-hidden"
      >
        <SheetHeader className="px-3 py-2.5 border-b border-border bg-[var(--neutral-50)] flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-7 w-7 rounded-lg bg-[var(--brand-50)] border border-[var(--brand-100)] flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-[var(--brand-500)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-label-md text-[var(--neutral-900)]">CareLens</SheetTitle>
                  <Badge variant="outline" className="text-ds-badge h-4 px-1.5 border-border text-[var(--neutral-600)] bg-[var(--neutral-50)] flex-shrink-0">
                    {hasPermission("edit_summary") ? "Interactive" : hasPermission("approve_pa") ? "Review" : "Audit"}
                  </Badge>
                </div>
                <p className="text-caption text-[var(--neutral-500)] truncate">{selectedPatient.name} · {selectedPatient.insurance} · Demo data</p>
              </div>
            </div>
            {roleView.showExport && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" aria-label="Export analysis">
                <Download className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-overline text-[var(--neutral-500)] mb-0.5">Rules met</p>
                <p className="text-body text-[var(--neutral-900)]">{rulesMet(selectedPatient)} of {selectedPatient.payerRules.length}</p>
              </div>
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-overline text-[var(--neutral-500)] mb-0.5">Documents</p>
                <p className="text-body text-[var(--neutral-900)]">{selectedPatient.documentsProcessed}</p>
              </div>
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-overline text-[var(--neutral-500)] mb-0.5">Open conflicts</p>
                <p className="text-body text-[var(--neutral-900)]">{careLens.conflictingNotes.length}</p>
              </div>
            </div>

            <div className="space-y-1">
              {selectedPatient.payerRules.map((rule) => (
                <div key={rule.id} className="flex items-start gap-1.5">
                  <span className={cn(
                    "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                    rule.status === "satisfied" ? "bg-[var(--neutral-500)]" : "bg-[var(--status-warn-text)]"
                  )} />
                  <span className="text-caption text-[var(--neutral-700)]">{rule.rule}</span>
                </div>
              ))}
              {careLens.policyGaps.map((gap) => (
                <div key={gap.id} className="flex items-start gap-1.5">
                  <span className={cn(
                    "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                    gap.status === "resolved" ? "bg-[var(--neutral-500)]" : "bg-[var(--status-warn-text)]"
                  )} />
                  <span className="text-caption text-[var(--neutral-700)]">{gap.gap}</span>
                </div>
              ))}
            </div>

            <Collapsible open={risksOpen} onOpenChange={setRisksOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5">
                <span className="text-meta text-[var(--neutral-700)] flex items-center gap-1.5">
                  {risksOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <AlertTriangle className="h-3 w-3 text-[var(--neutral-500)]" />
                  Risk Factors
                  {openRiskCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-ds-badge bg-[var(--status-error-bg)] text-[var(--status-error-text)] border border-[var(--status-error-border)]">
                      {openRiskCount}
                    </Badge>
                  )}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 space-y-1.5">
                {careLens.riskFactors.slice(0, 4).map((risk) => {
                  const isAddressed = risk.status === "addressed"
                  const isDismissed = risk.status === "not_applicable"
                  const isOpen = risk.status === "open"
                  
                  return (
                    <div 
                      key={risk.id} 
                      className={cn(
                        "rounded-lg border text-caption overflow-hidden transition-all",
                        isOpen ? "bg-transparent border-border" : 
                        isAddressed ? "bg-transparent border-border" :
                        isDismissed ? "bg-[var(--neutral-50)] border-border opacity-50" :
                        "bg-[var(--neutral-50)] border-border"
                      )}
                    >
                      <div className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={cn(
                              "text-caption text-[var(--neutral-800)] leading-tight",
                              (isAddressed || isDismissed) && "line-through opacity-60"
                            )}>{risk.factor}</p>
                            {isOpen && risk.explanation && (
                              <p className="text-caption text-[var(--neutral-600)] mt-1 leading-relaxed">{risk.explanation}</p>
                            )}
                          </div>
                          <RiskBadge level={risk.severity} />
                        </div>
                        
                        {isAddressed && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-[var(--neutral-300)] bg-[var(--neutral-100)] flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-500)]" />
                            </div>
                            <span className="text-caption text-[var(--neutral-600)]">Addressed</span>
                          </div>
                        )}
                        {isDismissed && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-border" />
                            <span className="text-caption text-[var(--neutral-500)]">Dismissed</span>
                          </div>
                        )}
                        
                        {isOpen && roleView.showActions && (
                          <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-border">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-caption text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] gap-1 bg-transparent"
                                onClick={() => {
                                  const previous = risk.status
                                  updateRiskFactorStatus(risk.id, "addressed", "Resolved")
                                  logAction("risk addressed", selectedPatient.id)
                                  toast({
                                    title: "Risk addressed",
                                    action: (
                                      <ToastAction altText="Undo" onClick={() => updateRiskFactorStatus(risk.id, previous, "Reopened")}>
                                        Undo
                                      </ToastAction>
                                    ),
                                  })
                                }}
                              >
                                <Check className="h-3 w-3" />
                                Addressed
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-caption text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] gap-1 bg-transparent"
                                onClick={() => {
                                  const previous = risk.status
                                  updateRiskFactorStatus(risk.id, "not_applicable", "Not applicable")
                                  logAction("risk dismissed", selectedPatient.id)
                                  toast({
                                    title: "Risk dismissed",
                                    action: (
                                      <ToastAction altText="Undo" onClick={() => updateRiskFactorStatus(risk.id, previous, "Reopened")}>
                                        Undo
                                      </ToastAction>
                                    ),
                                  })
                                }}
                              >
                                <X className="h-3 w-3" />
                                Dismiss
                              </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={gapsOpen} onOpenChange={setGapsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5">
                <span className="text-meta text-[var(--neutral-700)] flex items-center gap-1.5">
                  {gapsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <FileWarning className="h-3 w-3 text-[var(--neutral-500)]" />
                  Policy Gaps
                  {openGapCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-ds-badge bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border border-[var(--status-warn-border)]">
                      {openGapCount}
                    </Badge>
                  )}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 space-y-1.5">
                {careLens.policyGaps.slice(0, 3).map((gap) => (
                  <div 
                    key={gap.id} 
                    className={cn(
                      "p-2 rounded-md border",
                      gap.status === "open" 
                        ? "bg-transparent border-border" 
                        : "bg-[var(--neutral-50)] border-border opacity-60"
                    )}
                  >
                    <p className="text-caption text-[var(--neutral-800)] leading-tight">{gap.gap}</p>
                    {gap.status === "open" && gap.policyReference && (
                      <p className="text-caption text-[var(--neutral-500)] mt-1">Policy: {gap.policyReference}</p>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={recsOpen} onOpenChange={setRecsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5">
                <span className="text-meta text-[var(--neutral-700)] flex items-center gap-1.5">
                  {recsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <Lightbulb className="h-3 w-3 text-[var(--neutral-500)]" />
                  Recommendations
                  {pendingRecCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1.5 text-ds-badge bg-[var(--status-info-bg)] text-[var(--status-info-text)] border border-[var(--status-info-border)]">
                      {pendingRecCount}
                    </Badge>
                  )}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 space-y-1.5">
                {careLens.recommendations.slice(0, 3).map((rec) => {
                  const isCompleted = rec.status === "completed"
                  const isDismissed = rec.status === "dismissed"
                  const isPending = rec.status === "pending"
                  const isInProgress = rec.status === "in_progress"
                  
                  return (
                    <div 
                      key={rec.id} 
                      className={cn(
                        "rounded-lg border text-caption overflow-hidden transition-all",
                        isPending || isInProgress ? "bg-[var(--status-info-bg)] border-[var(--status-info-border)]" : 
                        isCompleted ? "bg-[var(--status-ok-bg)] border-[var(--status-ok-border)]" :
                        isDismissed ? "bg-[var(--neutral-50)] border-border opacity-50" :
                        "bg-[var(--neutral-50)] border-border"
                      )}
                    >
                      <div className="p-2">
                        <p className={cn(
                          "text-caption text-[var(--neutral-800)] leading-tight",
                          (isCompleted || isDismissed) && "line-through opacity-60"
                        )}>{rec.text}</p>
                        
                        {isCompleted && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-[var(--neutral-300)] bg-[var(--neutral-100)] flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-[var(--neutral-500)]" />
                            </div>
                            <span className="text-caption text-[var(--neutral-600)]">Completed</span>
                          </div>
                        )}
                        {isDismissed && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-border" />
                            <span className="text-caption text-[var(--neutral-500)]">Skipped</span>
                          </div>
                        )}
                        {isInProgress && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <Loader2 className="h-3 w-3 text-[var(--neutral-500)] animate-spin" />
                            <span className="text-caption text-[var(--neutral-600)]">In progress</span>
                          </div>
                        )}
                        
                        {isPending && roleView.showActions && (
                          <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-[var(--status-info-border)]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-caption text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] gap-1 bg-transparent"
                              onClick={() => handleQuickAction("apply_pattern")}
                            >
                              Apply
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-caption text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] gap-1 bg-transparent"
                              onClick={() => {
                                updateRecommendationStatus(rec.id, "completed", "Done")
                                toast({ title: "Recommendation Completed", description: "Action marked as done" })
                              }}
                            >
                              <Check className="h-3 w-3" />
                              Done
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-caption text-[var(--neutral-500)] hover:bg-[var(--neutral-50)] gap-1 bg-transparent"
                              onClick={() => {
                                updateRecommendationStatus(rec.id, "dismissed", "Skipped")
                                toast({ title: "Recommendation Skipped", description: "Action dismissed" })
                              }}
                            >
                              <X className="h-3 w-3" />
                              Skip
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>

            {hasPermission("view_audit_log") && (
              <Button variant="outline" className="w-full h-8 text-label-sm gap-1.5 bg-transparent">
                <Download className="h-3 w-3" />
                Export Analysis Report
              </Button>
            )}
            <div aria-live="polite" aria-relevant="additions" className="space-y-2">
              {chatMessages.filter((message) => message.role !== "user").map((message, index) => (
                <p key={`${message.role}-${index}`} className="text-caption text-[var(--neutral-700)]">{message.content}</p>
              ))}
            </div>
          </div>
        </ScrollArea>

      </SheetContent>
    </Sheet>
  )
}
