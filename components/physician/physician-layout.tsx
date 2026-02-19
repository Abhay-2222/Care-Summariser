"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { statusBadgeStyles } from "@/lib/design-system"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Shield,
  Brain,
  Stethoscope,
  XCircle,
} from "lucide-react"

export function PhysicianLayout() {
  const {
    patients,
    physicianApprove,
    physicianDefer,
    physicianEscalate,
  } = useApp()

  const pendingCases = patients.filter(
    (p) => p.workflow.status === "needs_physician"
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [notes, setNotes] = useState("")
  const [actionTaken, setActionTaken] = useState<string | null>(null)

  const currentCase = pendingCases[currentIndex] || null
  const totalCases = pendingCases.length

  const goToNext = () => {
    setNotes("")
    setActionTaken(null)
    if (currentIndex < totalCases - 1) setCurrentIndex((i) => i + 1)
  }

  const goToPrev = () => {
    setNotes("")
    setActionTaken(null)
    if (currentIndex > 0) setCurrentIndex((i) => i - 1)
  }

  const handleApprove = () => {
    if (!currentCase) return
    physicianApprove(currentCase.id, notes || undefined)
    setActionTaken("approved")
  }

  const handleDefer = () => {
    if (!currentCase) return
    physicianDefer(currentCase.id, notes || undefined)
    setActionTaken("deferred")
  }

  const handleEscalate = () => {
    if (!currentCase) return
    physicianEscalate(currentCase.id, notes || undefined)
    setActionTaken("escalated")
  }

  // Empty state
  if (totalCases === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7 text-[var(--success)]" />
          </div>
          <p className="text-[13px] text-foreground">No cases awaiting review</p>
          <p className="text-[11px] text-[var(--neutral-500)]">All physician reviews are complete. Check back later.</p>
        </div>
      </div>
    )
  }

  if (!currentCase) return null

  const highRiskFactors = currentCase.careLens.riskFactors.filter(
    (rf) => rf.severity === "High"
  )
  const missingRules = currentCase.payerRules.filter(
    (r) => r.status === "missing"
  )
  const unclearRules = currentCase.payerRules.filter(
    (r) => r.status === "unclear"
  )

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2.5">
          <Stethoscope className="h-4 w-4 text-teal-600" />
          <span className="text-[12px] text-teal-700 tracking-tight">
            Physician Review
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="h-7 w-7 p-0 border-border hover:border-slate-900 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="sr-only">Previous case</span>
          </Button>
          <span className="text-[11px] font-mono text-[var(--neutral-400)] tabular-nums min-w-[60px] text-center">
            {currentIndex + 1} of {totalCases}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === totalCases - 1}
            className="h-7 w-7 p-0 border-border hover:border-slate-900 hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Next case</span>
          </Button>
        </div>
      </div>

      {/* Confirmation banner */}
      {actionTaken && (
        <div
          className={cn(
            "px-5 py-2.5 flex items-center justify-between",
            actionTaken === "approved" && "bg-emerald-50 border-b border-emerald-200",
            actionTaken === "deferred" && "bg-amber-50 border-b border-amber-200",
            actionTaken === "escalated" && "bg-red-50 border-b border-red-200"
          )}
        >
          <span
            className={cn(
              "text-[11px]",
              actionTaken === "approved" && "text-emerald-700",
              actionTaken === "deferred" && "text-amber-700",
              actionTaken === "escalated" && "text-red-700"
            )}
          >
            Case {actionTaken}. {currentIndex < totalCases - 1 ? "Proceed to next case." : "All cases reviewed."}
          </span>
          {currentIndex < totalCases - 1 && (
            <Button size="sm" variant="outline" onClick={goToNext} className="h-7 text-[11px]">
              Next case
            </Button>
          )}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Patient hero header */}
        <div className="bg-[#fafaf8] border-b border-[#ece9e4] px-5 md:px-10 py-6 md:py-8">
          <div className="max-w-3xl">
            {/* Urgency tag */}
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] px-2 py-0.5 mb-3",
                statusBadgeStyles[currentCase.urgency]
              )}
            >
              {currentCase.urgency}
            </Badge>

            {/* Patient name - serif italic hero */}
            <h1 className="font-serif italic text-[28px] md:text-[32px] leading-none tracking-tight text-foreground mb-1">
              {currentCase.name}
            </h1>
            <span className="text-[11px] font-mono text-[var(--neutral-400)]">{currentCase.mrn}</span>

            {/* Info strip */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#ece9e4]">
              <span className="text-[12px] font-mono text-[var(--neutral-500)]">
                {currentCase.age}{currentCase.gender === "F" ? "F" : "M"}
              </span>
              <div className="w-px h-3 bg-slate-200" />
              <span className="text-[12px] font-mono text-[var(--neutral-500)]">{currentCase.insurance}</span>
              <div className="w-px h-3 bg-slate-200" />
              <span className="text-[12px] font-mono text-[var(--neutral-500)]">{currentCase.lengthOfStay}</span>
              <div className="w-px h-3 bg-slate-200" />
              <span className="text-[12px] font-mono text-[var(--neutral-500)]">Room {currentCase.room}</span>
            </div>
          </div>
        </div>

        {/* Content cards */}
        <div className="px-5 md:px-10 py-5 space-y-4 max-w-3xl">
          {/* Chief complaint */}
          <div className="space-y-1">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--neutral-400)]">Chief complaint</p>
            <p className="text-[12px] text-foreground leading-relaxed">{currentCase.chiefComplaint}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[var(--neutral-400)]">Diagnoses</p>
            <div className="flex flex-wrap gap-1.5">
              {currentCase.diagnoses.map((dx, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-[var(--neutral-600)] border border-border"
                >
                  {dx}
                </span>
              ))}
            </div>
          </div>

          {/* High-severity risk factors - left-border, neutral severity label */}
          {highRiskFactors.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                <span className="text-[11px] text-foreground">High-severity risk factors</span>
                <span className="text-[9px] font-mono text-[var(--neutral-400)] ml-auto">{highRiskFactors.length}</span>
              </div>
              {highRiskFactors.map((rf) => (
                <div
                  key={rf.id}
                  className="border border-border border-l-[3px] border-l-slate-900 rounded-md px-4 py-3 bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-[12px] text-foreground leading-tight">{rf.factor}</p>
                      {rf.mitigation && (
                        <p className="text-[11px] font-mono text-[var(--neutral-400)] mt-1">{rf.mitigation}</p>
                      )}
                    </div>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[var(--neutral-400)] flex-shrink-0 mt-0.5">
                      {rf.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payer rule gaps - left-border, neutral styling */}
          {(missingRules.length > 0 || unclearRules.length > 0) && (
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-[var(--neutral-500)]" />
                <span className="text-[11px] text-foreground">Payer rule gaps</span>
                <span className="text-[9px] font-mono text-[var(--neutral-400)] ml-auto">{missingRules.length + unclearRules.length}</span>
              </div>
              {missingRules.map((r) => (
                <div
                  key={r.id}
                  className="border border-border border-l-[3px] border-l-slate-900 rounded-md px-4 py-3 bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12px] text-foreground leading-tight flex-1">{r.rule}</p>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[var(--neutral-400)] flex-shrink-0 mt-0.5">
                      Missing
                    </span>
                  </div>
                </div>
              ))}
              {unclearRules.map((r) => (
                <div
                  key={r.id}
                  className="border border-border border-l-[2px] border-l-slate-400 rounded-md px-4 py-3 bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12px] text-foreground leading-tight flex-1">{r.rule}</p>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[var(--neutral-400)] flex-shrink-0 mt-0.5">
                      Unclear
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Clinical course */}
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-[var(--neutral-400)]" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--neutral-400)]">Clinical course</span>
            </div>
            <p className="text-[12px] text-[var(--neutral-600)] leading-relaxed">{currentCase.clinicalCourse}</p>
          </div>

          {/* Decision notes */}
          <div className="pt-2 space-y-1.5">
            <label htmlFor="physician-notes" className="text-[9px] font-mono uppercase tracking-widest text-[var(--neutral-400)]">
              Decision notes (optional)
            </label>
            <Textarea
              id="physician-notes"
              placeholder="Add reasoning for your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-[12px] min-h-[60px] resize-none border-border focus:border-slate-400"
              disabled={!!actionTaken}
            />
          </div>

          <div className="h-20" />
        </div>
      </div>

      {/* Sticky frosted-glass action bar */}
      <div className="sticky bottom-0 border-t border-border bg-card/90 backdrop-blur-xl px-5 md:px-10 py-3">
        <div className="flex items-center gap-3 max-w-3xl">
          <div className="flex items-center gap-1.5 mr-auto">
            <Clock className="h-3 w-3 text-[var(--neutral-400)]" />
            <span className="text-[10px] text-[var(--neutral-400)] font-mono">
              Assigned by {currentCase.workflow.assignment?.assignedTo || "System"}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEscalate}
            disabled={!!actionTaken}
            className="h-9 text-[11px] gap-1.5 px-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Escalate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDefer}
            disabled={!!actionTaken}
            className="h-9 text-[11px] gap-1.5 px-4 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
          >
            <Clock className="h-3.5 w-3.5" />
            Defer
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={!!actionTaken}
            className="h-9 text-[11px] gap-1.5 px-5 bg-slate-900 hover:bg-slate-800 text-white tracking-tight"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}
