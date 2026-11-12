"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"

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
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-[var(--neutral-300)] hover:bg-[var(--neutral-50)] text-[var(--neutral-700)] text-caption transition-colors"
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
  const { selectedPatient, currentRole, currentUser, hasPermission, updateRiskFactorStatus, updateRecommendationStatus } = useApp()
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
  
  const userFirstName = currentUser.name.split(" ")[0]

  const handleQuickActionTrigger = (actionId: string) => {
    console.log(`Quick action triggered: ${actionId}`)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])
  
  useEffect(() => {
    if (isOpen && selectedPatient && !hasGreeted && mode === "full") {
      setHasGreeted(true)
      const { careLens } = selectedPatient
      const openRisks = careLens.riskFactors.filter(r => r.status === "open")
      const openGaps = careLens.policyGaps.filter(g => g.status === "open")
      
      // Simple contextual greeting - not overly chatty
      let greeting = ""
      if (openRisks.length > 0 && openRisks[0].severity === "High") {
        greeting = `${openRisks.length} risk${openRisks.length > 1 ? "s" : ""} flagged. Top issue: ${openRisks[0].factor}`
      } else if (openGaps.length > 0) {
        greeting = `${openGaps.length} policy gap${openGaps.length > 1 ? "s" : ""} to address before submission.`
      } else {
        greeting = `Case looks ready. All criteria met for ${selectedPatient.insurance}.`
      }
      
      setChatMessages([{ role: "assistant", content: greeting }])
    }
  }, [isOpen, selectedPatient, hasGreeted, mode])
  
  useEffect(() => {
    setHasGreeted(false)
    setChatMessages([])
  }, [selectedPatient?.id])

  if (!selectedPatient) return null

  const { careLens } = selectedPatient
  const isInteractive = mode === "full"
  
  const openRiskCount = careLens.riskFactors.filter(r => r.status === "open").length
  const openGapCount = careLens.policyGaps.filter(g => g.status === "open").length
  const pendingRecCount = careLens.recommendations.filter(r => r.status === "pending").length

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase()
    if (q.includes("los") || q.includes("length of stay")) {
      return "LOS risk is flagged because the patient's frailty score (6/10) combined with a 72-hour respiratory decline pattern suggests potential extended stay. Similar cases average 2.3 additional days. Consider documenting step-down criteria to mitigate."
    }
    if (q.includes("deny") || q.includes("denial")) {
      return `Denial risk is ${careLens.denialRisk}. ${openGapCount} policy gaps, ${openRiskCount} open risks.`
    }
    if (q.includes("confidence") || q.includes("score")) {
      const met = selectedPatient.payerRules.filter((rule) => rule.status === "satisfied").length
      return `${met} of ${selectedPatient.payerRules.length} requirements met.`
    }
    if (q.includes("override") || q.includes("challenge")) {
      return "To override a risk assessment, click the Challenge button next to the risk factor. Provide clinical justification and I'll recalculate confidence. All overrides are logged for audit compliance."
    }
    return `Based on ${selectedPatient.name}'s case: The primary diagnosis (${selectedPatient.diagnoses[0]}) with current payer rules suggests focusing on ${openGapCount > 0 ? "resolving policy gaps first" : "preparing PA documentation"}. Would you like specific guidance?`
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

  const handleChallenge = (_riskId: string, _riskFactor: string) => {
    // Chat is removed. The requirement row is the evidence.
  }
  
  const handleQuickAction = (actionType: string) => {
    setIsTyping(true)
    let response = ""
    let followUpActions: QuickAction[] = []
    
    switch (actionType) {
      case "draft_request":
        response = `Got it, ${userFirstName}. I've drafted a cardiology consult request for ${selectedPatient.name.split(" ")[0]}:\n\n"Requesting urgent cardiology consult for echo to document EF for ${selectedPatient.insurance} PA criteria. Patient with ${selectedPatient.diagnoses[0]}, admitted ${selectedPatient.admitted}."\n\nWant me to send this to cardiology?`
        followUpActions = [
          { id: "send", label: "Send to cardiology", icon: <Send className="h-2.5 w-2.5 mr-0.5" />, action: () => handleQuickActionTrigger("confirm_send") },
          { id: "edit", label: "Edit first", icon: <FileText className="h-2.5 w-2.5 mr-0.5" />, action: () => handleQuickActionTrigger("edit_draft") },
        ]
        break
      case "show_criteria":
        response = `Here's what ${selectedPatient.insurance} needs for ${selectedPatient.diagnoses[0]}:\n\n1. Echo with documented EF (currently missing)\n2. BNP > 400 or Troponin elevation (you have this)\n3. Failed outpatient management (documented)\n4. Cardiology consult within 24hrs (pending)\n\nYou're at 2/4 criteria. The echo is the key blocker.`
        followUpActions = [
          { id: "draft", label: "Request echo now", icon: <Zap className="h-2.5 w-2.5 mr-0.5" />, action: () => handleQuickActionTrigger("draft_request") },
        ]
        break
      case "similar_cases":
        response = `Found 12 similar ${selectedPatient.diagnoses[0]} cases you've worked on:\n\n- 8 approved (avg 1.8 days to decision)\n- 3 initially denied, won on appeal\n- 1 denied (missing echo - same gap as this case)\n\nThe approved cases all had echo within 24hrs of admission. Want me to apply what worked?`
        followUpActions = [
          { id: "apply", label: "Apply winning pattern", icon: <Check className="h-2.5 w-2.5 mr-0.5" />, action: () => handleQuickActionTrigger("apply_pattern") },
        ]
        break
      case "address_gaps":
        response = `Let's close these gaps for ${selectedPatient.name.split(" ")[0]}:\n\n${careLens.policyGaps.filter(g => g.status === "open").map((g, i) => `${i+1}. ${g.gap}`).join("\n")}\n\nI can draft documentation requests for each. Start with the first one?`
        followUpActions = [
          { id: "draft_all", label: "Draft all requests", icon: <FileText className="h-2.5 w-2.5 mr-0.5" />, action: () => handleQuickActionTrigger("draft_all") },
        ]
        break
      case "generate_pa":
        response = `Great choice, ${userFirstName}! I'll prep the PA for ${selectedPatient.name.split(" ")[0]}. Based on the ${selectedPatient.documentsProcessed} docs I've analyzed, here's the medical necessity summary I'd include:\n\n"${selectedPatient.diagnoses[0]} requiring inpatient level of care due to..."\n\nReady to generate the full PA document?`
        followUpActions = [
          { id: "generate", label: "Generate PA now", icon: <FileText className="h-2.5 w-2.5 mr-0.5" />, action: () => handleQuickActionTrigger("open_pa") },
        ]
        break
      case "confirm_send":
        response = `Done! Consult request sent to cardiology. I'll notify you when they respond. In the meantime, anything else for ${selectedPatient.name.split(" ")[0]}'s case?`
        break
      case "apply_pattern":
        response = `Applied the winning pattern from your approved cases. I've updated the recommendations to match what worked before. The key additions:\n\n1. Echo request (just sent)\n2. Early discharge planning note template\n3. ${selectedPatient.insurance}-specific language in clinical summary\n\nThis should boost approval confidence significantly.`
        break
      default:
        response = `I'm on it, ${userFirstName}. What would you like to do next with ${selectedPatient.name.split(" ")[0]}'s case?`
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
      subtitle: `Hey ${userFirstName}`,
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
                <p className="text-caption text-[var(--neutral-500)] truncate">{selectedPatient.name} · {selectedPatient.insurance}</p>
              </div>
            </div>
            {roleView.showExport && (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                <Download className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-overline text-[var(--neutral-500)] mb-0.5">Denial risk</p>
                <p className="text-body text-[var(--neutral-900)]">{careLens.denialRisk}</p>
              </div>
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-overline text-[var(--neutral-500)] mb-0.5">Requirements</p>
                <p className="text-body text-[var(--neutral-900)]">
                  {selectedPatient.payerRules.filter(r => r.status === "satisfied").length}/{selectedPatient.payerRules.length}
                </p>
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
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--status-error-border)]">
                            <button 
                              type="button"
                              className="text-caption text-[var(--neutral-600)] hover:text-foreground underline"
                              onClick={() => handleChallenge(risk.id, risk.factor)}
                            >
                              Why is this flagged?
                            </button>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-caption text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] gap-1 bg-transparent"
                                onClick={() => {
                                  updateRiskFactorStatus(risk.id, "addressed", "Resolved")
                                  toast({ title: "Risk Addressed", description: "Marked as addressed" })
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
                                  updateRiskFactorStatus(risk.id, "not_applicable", "Not applicable")
                                  toast({ title: "Risk Dismissed", description: "Marked as not applicable" })
                                }}
                              >
                                <X className="h-3 w-3" />
                                Dismiss
                              </Button>
                            </div>
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
          </div>
        </ScrollArea>

      </SheetContent>
    </Sheet>
  )
}
