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
import type { ConfidenceLevel, RiskLevel } from "@/lib/types"
import { riskStyles } from "@/lib/design-system"

interface CareLensDrawerProps {
  isOpen: boolean
  onClose: () => void
  mode: "full" | "readonly"
}

interface ConfidenceFactorProps {
  label: string
  score: number
  explanation: string
  factors: { label: string; met: boolean }[]
  color: string
}

function ExplainableConfidence({ label, score, explanation, factors }: ConfidenceFactorProps) {
  const [expanded, setExpanded] = useState(false)
  const metCount = factors.filter(f => f.met).length
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-2.5 flex items-center justify-between hover:bg-[var(--neutral-50)] transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-1.5 w-6 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
            <div className="h-full rounded-full bg-slate-400" style={{ width: `${score}%` }} />
          </div>
          <span className="text-[10px] text-[var(--neutral-600)]">{label}</span>
          <span className="text-[9px] text-[var(--neutral-400)]">({metCount}/{factors.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-800">{score}%</span>
          {expanded ? <ChevronDown className="h-3 w-3 text-[var(--neutral-400)]" /> : <ChevronRight className="h-3 w-3 text-[var(--neutral-400)]" />}
        </div>
      </button>
      {expanded && (
        <div className="px-2.5 pb-2.5 border-t border-border bg-[var(--neutral-50)]/50">
          <p className="text-[9px] text-[var(--neutral-500)] py-2 leading-relaxed">{explanation}</p>
          <div className="space-y-1">
            {factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn(
                  "h-3 w-3 rounded-full border flex items-center justify-center flex-shrink-0",
                  factor.met ? "border-slate-300 bg-slate-100" : "border-border"
                )}>
                  {factor.met && <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
                </div>
                <span className={cn(
                  "text-[9px]",
                  factor.met ? "text-[var(--neutral-600)]" : "text-[var(--neutral-400)]"
                )}>{factor.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={cn("px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wide", riskStyles[level])}>
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
        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Brain className="h-3 w-3 text-[var(--neutral-500)]" />
        </div>
      )}
      <div className={cn(
        "max-w-[85%] rounded-lg text-[10px]",
        role === "user" 
          ? "bg-slate-700 text-white px-2 py-1.5" 
          : "bg-slate-100 border border-border"
      )}>
        {isLoading ? (
          <div className="flex items-center gap-1.5 px-2 py-1.5">
            <Loader2 className="h-3 w-3 animate-spin text-[var(--neutral-500)]" />
            <span className="text-[var(--neutral-500)]">Analyzing...</span>
          </div>
        ) : (
          <div>
            <div className="px-2 py-1.5 text-foreground">{content}</div>
            {quickActions && quickActions.length > 0 && (
              <div className="flex flex-wrap gap-1 px-2 pb-1.5 pt-1 border-t border-border">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-card border border-border hover:bg-[var(--neutral-50)] text-[var(--neutral-600)] text-[9px] transition-colors"
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

  const levelToPercent = (level: ConfidenceLevel): number => {
    return level === "High" ? 90 : level === "Medium" ? 65 : 35
  }
  const confidencePercents = {
    evidence: levelToPercent(careLens.confidenceBreakdown.evidenceCompleteness),
    policy: levelToPercent(careLens.confidenceBreakdown.policyAlignment),
    clinical: levelToPercent(careLens.confidenceBreakdown.clinicalClarity),
  }

  const getAIResponse = (question: string): string => {
    const q = question.toLowerCase()
    if (q.includes("los") || q.includes("length of stay")) {
      return "LOS risk is flagged because the patient's frailty score (6/10) combined with a 72-hour respiratory decline pattern suggests potential extended stay. Similar cases average 2.3 additional days. Consider documenting step-down criteria to mitigate."
    }
    if (q.includes("deny") || q.includes("denial")) {
      return `Denial risk is ${careLens.denialRisk} based on: ${openGapCount} policy gaps, ${openRiskCount} unmitigated risks. Historical approval rate for similar ${selectedPatient.insurance} cases: 72%. Key factor: documentation completeness.`
    }
    if (q.includes("confidence") || q.includes("score")) {
      const avgConfidence = Math.round((confidencePercents.evidence + confidencePercents.policy + confidencePercents.clinical) / 3)
      return `Confidence is ${careLens.overallConfidence} (~${avgConfidence}% avg) because evidence=${confidencePercents.evidence}%, policy=${confidencePercents.policy}%, clinical=${confidencePercents.clinical}%. Resolve gaps to improve.`
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

  const handleChallenge = (riskId: string, riskFactor: string) => {
    setChatOpen(true)
    setChatMessages(prev => [...prev, 
      { role: "user", content: `Why is "${riskFactor}" flagged as a risk?` }
    ])
    setIsTyping(true)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: "assistant", 
        content: `This risk was identified because: 1) Pattern analysis shows similar cases had 34% higher denial rates, 2) Payer ${selectedPatient.insurance} specifically requires documentation for this scenario. To override: provide clinical justification showing why this doesn't apply to this patient.`
      }])
      setIsTyping(false)
    }, 1000)
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
      badgeColor: "bg-[var(--status-info-bg)] text-[var(--brand-500)] border-blue-200",
      showChat: true,
      showActions: true,
      showExport: false,
    },
    physician: {
      title: "Clinical Review",
      subtitle: "Read-Only Analysis",
      badgeColor: "bg-[var(--status-info-bg)] text-[var(--brand-500)] border-blue-200",
      showChat: false,
      showActions: false,
      showExport: false,
    },
    auditor: {
      title: "Compliance Report",
      subtitle: "Audit & Export",
      badgeColor: "bg-[var(--status-ok-bg)] text-[var(--success)] border-emerald-200",
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
              <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 text-[var(--neutral-500)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-[12px] font-medium text-slate-800">CareLens</SheetTitle>
                  <Badge variant="outline" className="text-[7px] h-4 px-1.5 border-border text-[var(--neutral-500)] bg-[var(--neutral-50)] flex-shrink-0">
                    {hasPermission("edit_summary") ? "Interactive" : hasPermission("approve_pa") ? "Review" : "Audit"}
                  </Badge>
                </div>
                <p className="text-[9px] text-[var(--neutral-500)] truncate">{selectedPatient.name} - {selectedPatient.insurance}</p>
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
            <div className="p-2.5 bg-[var(--neutral-50)] rounded-lg border border-border">
              <p className="text-[10px] text-[var(--neutral-500)] leading-relaxed">
                Analyzed {selectedPatient.documentsProcessed} documents for this case.
                {openRiskCount > 0 
                  ? <> Found {openRiskCount} item{openRiskCount > 1 ? 's' : ''} to review below.</>
                  : <> Ready for PA preparation.</>
                }
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-[8px] text-[var(--neutral-400)] uppercase tracking-wide">Confidence</p>
                <p className="text-[13px] font-mono text-slate-800">{careLens.overallConfidence}</p>
              </div>
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-[8px] text-[var(--neutral-400)] uppercase tracking-wide">Denial Risk</p>
                <p className="text-[13px] font-mono text-slate-800">{careLens.denialRisk}</p>
              </div>
              <div className="p-2 rounded-lg border border-border bg-[var(--neutral-50)] text-center">
                <p className="text-[8px] text-[var(--neutral-400)] uppercase tracking-wide">Rules</p>
                <p className="text-[13px] font-mono text-slate-800">
                  {selectedPatient.payerRules.filter(r => r.status === "satisfied").length}/{selectedPatient.payerRules.length}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-[var(--neutral-600)]">How we calculated confidence</p>
              <p className="text-[9px] text-[var(--neutral-500)] -mt-1">Click each score to see contributing factors</p>
              
              <ExplainableConfidence 
                label="Evidence Quality"
                score={confidencePercents.evidence}
                color="bg-[var(--status-info-bg)]0"
                explanation="Based on completeness and relevance of uploaded documentation for this diagnosis and payer."
                factors={[
                  { label: "Admission H&P found", met: true },
                  { label: "Lab results within 24hrs", met: true },
                  { label: "Imaging reports present", met: selectedPatient.documentsProcessed > 10 },
                  { label: "Specialist consult documented", met: false },
                ]}
              />
              
              <ExplainableConfidence 
                label="Policy Alignment"
                score={confidencePercents.policy}
                color="bg-[var(--status-info-bg)]0"
                explanation={`Based on ${selectedPatient.insurance}'s published criteria for ${selectedPatient.diagnoses[0]}.`}
                factors={[
                  { label: `${selectedPatient.insurance} medical necessity met`, met: selectedPatient.payerRules.filter(r => r.status === "satisfied").length > 2 },
                  { label: "Length of stay justified", met: true },
                  { label: "Level of care appropriate", met: true },
                  { label: "All required documentation present", met: confidencePercents.policy > 70 },
                ]}
              />
              
              <ExplainableConfidence 
                label="Clinical Clarity"
                score={confidencePercents.clinical}
                color="bg-[var(--status-ok-bg)]0"
                explanation="Based on how clearly the clinical narrative supports medical necessity."
                factors={[
                  { label: "Diagnosis clearly documented", met: true },
                  { label: "Treatment plan articulated", met: true },
                  { label: "Clinical progression noted", met: true },
                  { label: "Discharge criteria defined", met: confidencePercents.clinical > 85 },
                ]}
              />
            </div>

            <Collapsible open={risksOpen} onOpenChange={setRisksOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5">
                <span className="text-[10px] text-[var(--neutral-600)] flex items-center gap-1.5">
                  {risksOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <AlertTriangle className="h-3 w-3 text-[var(--neutral-400)]" />
                  Risk Factors
                  {openRiskCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-red-100 text-[var(--destructive)]">
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
                        "rounded-lg border text-[10px] overflow-hidden transition-all",
                        isOpen ? "bg-[var(--status-error-bg)]/50 border-red-200" : 
                        isAddressed ? "bg-[var(--status-ok-bg)]/50 border-emerald-200" :
                        isDismissed ? "bg-[var(--neutral-50)] border-border opacity-50" :
                        "bg-[var(--neutral-50)] border-border"
                      )}
                    >
                      <div className="p-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={cn(
                              "text-foreground leading-tight",
                              (isAddressed || isDismissed) && "line-through opacity-60"
                            )}>{risk.factor}</p>
                            {/* Show explanation inline when expanded */}
                            {isOpen && risk.explanation && (
                              <p className="text-[9px] text-[var(--neutral-500)] mt-1 leading-relaxed">{risk.explanation}</p>
                            )}
                          </div>
                          <RiskBadge level={risk.severity} />
                        </div>
                        
                        {/* Status indicator for resolved items */}
                        {isAddressed && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            </div>
                            <span className="text-[9px] text-[var(--neutral-500)]">Addressed</span>
                          </div>
                        )}
                        {isDismissed && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-border" />
                            <span className="text-[9px] text-[var(--neutral-400)]">Dismissed</span>
                          </div>
                        )}
                        
                        {/* Action buttons for open risks */}
                        {isOpen && roleView.showActions && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-100">
                            <button 
                              type="button"
                              className="text-[9px] text-[var(--neutral-500)] hover:text-foreground underline"
                              onClick={() => handleChallenge(risk.id, risk.factor)}
                            >
                              Why is this flagged?
                            </button>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-[9px] text-[var(--neutral-600)] hover:bg-slate-100 gap-1 bg-transparent"
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
                                className="h-6 px-2 text-[9px] text-[var(--neutral-400)] hover:bg-[var(--neutral-50)] gap-1 bg-transparent"
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
                <span className="text-[10px] text-[var(--neutral-600)] flex items-center gap-1.5">
                  {gapsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <FileWarning className="h-3 w-3 text-[var(--neutral-400)]" />
                  Policy Gaps
                  {openGapCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-amber-100 text-[var(--warning)]">
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
                      "p-2 rounded-md border text-[10px]",
                      gap.status === "open" 
                        ? "bg-[var(--status-warn-bg)]/50 border-amber-200" 
                        : "bg-[var(--neutral-50)] border-border opacity-60"
                    )}
                  >
                    <p className="text-foreground leading-tight">{gap.gap}</p>
                    {gap.status === "open" && gap.policyReference && (
                      <p className="text-[9px] text-[var(--neutral-400)] mt-1">Policy: {gap.policyReference}</p>
                    )}
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={recsOpen} onOpenChange={setRecsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5">
                <span className="text-[10px] text-[var(--neutral-600)] flex items-center gap-1.5">
                  {recsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <Lightbulb className="h-3 w-3 text-[var(--neutral-400)]" />
                  Recommendations
                  {pendingRecCount > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-blue-100 text-[var(--brand-500)]">
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
                        "rounded-lg border text-[10px] overflow-hidden transition-all",
                        isPending || isInProgress ? "bg-[var(--status-info-bg)]/50 border-blue-200" : 
                        isCompleted ? "bg-[var(--status-ok-bg)]/50 border-emerald-200" :
                        isDismissed ? "bg-[var(--neutral-50)] border-border opacity-50" :
                        "bg-[var(--neutral-50)] border-border"
                      )}
                    >
                      <div className="p-2">
                        <p className={cn(
                          "text-foreground leading-tight",
                          (isCompleted || isDismissed) && "line-through opacity-60"
                        )}>{rec.text}</p>
                        
                        {/* Status indicator for completed items */}
                        {isCompleted && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            </div>
                            <span className="text-[9px] text-[var(--neutral-500)]">Completed</span>
                          </div>
                        )}
                        {isDismissed && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <div className="h-3 w-3 rounded-full border border-border" />
                            <span className="text-[9px] text-[var(--neutral-400)]">Skipped</span>
                          </div>
                        )}
                        {isInProgress && (
                          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                            <Loader2 className="h-3 w-3 text-[var(--neutral-400)] animate-spin" />
                            <span className="text-[9px] text-[var(--neutral-500)]">In progress</span>
                          </div>
                        )}
                        
                        {/* Action buttons for pending recommendations */}
                        {isPending && roleView.showActions && (
                          <div className="flex items-center justify-end gap-1 mt-2 pt-2 border-t border-blue-100">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-[9px] text-[var(--neutral-600)] hover:bg-slate-100 gap-1 bg-transparent"
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
                              className="h-6 px-2 text-[9px] text-[var(--neutral-400)] hover:bg-slate-100 gap-1 bg-transparent"
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

            <div className="p-2 rounded-lg bg-[var(--neutral-50)] border border-border">
              <p className="text-[9px] text-[var(--neutral-500)] mb-1.5">{selectedPatient.insurance} Intel</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-400)]">Wait</span>
                  <span className="text-[var(--neutral-600)]">~4 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--neutral-400)]">Similar</span>
                  <span className="text-[var(--neutral-600)] font-mono">78%</span>
                </div>
              </div>
            </div>

            {hasPermission("view_audit_log") && (
              <Button variant="outline" className="w-full h-8 text-[10px] gap-1.5 bg-transparent">
                <Download className="h-3 w-3" />
                Export Analysis Report
              </Button>
            )}
          </div>
        </ScrollArea>

        {roleView.showChat && (
          <div className="border-t border-border bg-[var(--neutral-50)] flex-shrink-0">
            <Collapsible open={chatOpen} onOpenChange={setChatOpen}>
              <CollapsibleTrigger className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100">
                <span className="text-[10px] text-[var(--neutral-600)] flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
                  Ask CareLens
                  {chatMessages.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-[8px]">{chatMessages.length}</Badge>
                  )}
                </span>
                {chatOpen ? <ChevronDown className="h-3.5 w-3.5 text-[var(--neutral-400)]" /> : <ChevronRight className="h-3.5 w-3.5 text-[var(--neutral-400)]" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3">
                  <div className="h-36 overflow-y-auto mb-2 space-y-2 bg-card rounded-lg p-2.5 border border-border">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center px-2">
                        <MessageSquare className="h-6 w-6 text-slate-300 mb-2" />
                        <p className="text-[10px] text-[var(--neutral-500)]">Ask questions about this case</p>
                        <p className="text-[9px] text-[var(--neutral-400)] mt-0.5">e.g., "Why is evidence score low?" or "Draft a consult request"</p>
                      </div>
                    ) : (
                      <>
                        {chatMessages.map((msg, i) => (
                          <ChatMessage 
                            key={i} 
                            role={msg.role} 
                            content={msg.content} 
                            quickActions={msg.quickActions}
                            userName={userFirstName}
                          />
                        ))}
                        {isTyping && <ChatMessage role="coach" content="" isLoading />}
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {[
                      { label: "Why this score?", icon: <HelpCircle className="h-2.5 w-2.5" /> },
                      { label: "Draft request", icon: <FileText className="h-2.5 w-2.5" /> },
                      { label: "Similar cases", icon: <RefreshCw className="h-2.5 w-2.5" /> },
                    ].map((q) => (
                      <button
                        key={q.label}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[var(--neutral-600)] text-[9px] hover:bg-slate-200 transition-colors"
                        onClick={() => {
                          setChatInput(q.label)
                          setTimeout(() => handleSendMessage(), 100)
                        }}
                      >
                        {q.icon}
                        {q.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      placeholder="Ask about this case..."
                      className="min-h-[32px] h-8 text-[10px] resize-none"
                    />
                    <Button 
                      size="sm" 
                      className="h-8 w-8 p-0 bg-slate-800 hover:bg-slate-900 text-white"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isTyping}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
