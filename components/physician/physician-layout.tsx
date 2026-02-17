"use client"

import { useState } from "react"
import { useApp } from "@/lib/app-context"
import { textStyles, statusBadgeStyles, riskStyles, containerStyles, spacing } from "@/lib/design-system"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Shield,
  Brain,
  Stethoscope,
} from "lucide-react"

export function PhysicianLayout() {
  const {
    patients,
    physicianApprove,
    physicianDefer,
    physicianEscalate,
    currentUser,
  } = useApp()

  // Filter to only cases awaiting physician review
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
    if (currentIndex < totalCases - 1) {
      setCurrentIndex((i) => i + 1)
    }
  }

  const goToPrev = () => {
    setNotes("")
    setActionTaken(null)
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
    }
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
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <p className={cn(textStyles.title, "text-slate-700")}>No cases awaiting review</p>
          <p className={textStyles.body}>All physician reviews are complete. Check back later.</p>
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
      {/* Top bar: counter + navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-4 w-4 text-teal-600" />
          <span className={cn(textStyles.title, "text-teal-700")}>
            Physician Review
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="sr-only">Previous case</span>
          </Button>
          <span className={cn(textStyles.body, "tabular-nums min-w-[60px] text-center")}>
            {currentIndex + 1} of {totalCases}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === totalCases - 1}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Next case</span>
          </Button>
        </div>
      </div>

      {/* Confirmation banner when action was taken */}
      {actionTaken && (
        <div
          className={cn(
            "px-4 py-2.5 flex items-center justify-between",
            actionTaken === "approved" && "bg-emerald-50 border-b border-emerald-200",
            actionTaken === "deferred" && "bg-amber-50 border-b border-amber-200",
            actionTaken === "escalated" && "bg-red-50 border-b border-red-200"
          )}
        >
          <span
            className={cn(
              textStyles.body,
              "font-medium",
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

      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Patient identity + urgency */}
        <Card className={cn(containerStyles.card, "overflow-hidden")}>
          <div
            className={cn(
              "px-3 py-2 flex items-center justify-between",
              currentCase.urgency === "STAT" && "bg-red-50 border-b border-red-100",
              currentCase.urgency === "URGENT" && "bg-amber-50 border-b border-amber-100",
              currentCase.urgency === "ROUTINE" && "bg-slate-50 border-b border-slate-100"
            )}
          >
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] px-1.5 py-0 font-semibold",
                  statusBadgeStyles[currentCase.urgency]
                )}
              >
                {currentCase.urgency}
              </Badge>
              <span className={cn(textStyles.title, "text-[13px]")}>
                {currentCase.name}
              </span>
            </div>
            <span className={textStyles.body}>{currentCase.mrn}</span>
          </div>
          <CardContent className={spacing.cardPadding}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className={textStyles.label}>Age / Gender</p>
                <p className={textStyles.body}>
                  {currentCase.age}{currentCase.gender === "F" ? "F" : "M"}
                </p>
              </div>
              <div>
                <p className={textStyles.label}>Insurance</p>
                <p className={textStyles.body}>{currentCase.insurance}</p>
              </div>
              <div>
                <p className={textStyles.label}>LOS</p>
                <p className={textStyles.body}>{currentCase.lengthOfStay}</p>
              </div>
              <div>
                <p className={textStyles.label}>Room</p>
                <p className={textStyles.body}>{currentCase.room}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chief complaint + diagnoses */}
        <Card className={containerStyles.card}>
          <CardContent className={spacing.cardPadding}>
            <div className={spacing.itemGap}>
              <div>
                <p className={textStyles.label}>Chief complaint</p>
                <p className={cn(textStyles.body, "mt-0.5")}>{currentCase.chiefComplaint}</p>
              </div>
              <div>
                <p className={textStyles.label}>Diagnoses</p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {currentCase.diagnoses.map((dx, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200"
                    >
                      {dx}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CareLens: High-severity risk factors only */}
        {highRiskFactors.length > 0 && (
          <Card className={cn(containerStyles.card, "border-red-100")}>
            <CardContent className={spacing.cardPadding}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-3.5 w-3.5 text-blue-600" />
                <span className={cn(textStyles.title, "text-blue-700")}>
                  High-severity risk factors
                </span>
                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 ml-auto", riskStyles.High)}>
                  {highRiskFactors.length}
                </Badge>
              </div>
              <div className={spacing.itemGap}>
                {highRiskFactors.map((rf) => (
                  <div
                    key={rf.id}
                    className="flex items-start gap-2 p-2 bg-red-50/50 rounded border border-red-100"
                  >
                    <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={cn(textStyles.body, "text-red-800 font-medium")}>{rf.factor}</p>
                      {rf.mitigation && (
                        <p className={cn(textStyles.body, "text-red-600 mt-0.5")}>{rf.mitigation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payer rule gaps (missing + unclear) */}
        {(missingRules.length > 0 || unclearRules.length > 0) && (
          <Card className={cn(containerStyles.card, "border-amber-100")}>
            <CardContent className={spacing.cardPadding}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-3.5 w-3.5 text-amber-600" />
                <span className={cn(textStyles.title, "text-amber-700")}>
                  Payer rule gaps
                </span>
                <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 ml-auto", statusBadgeStyles.URGENT)}>
                  {missingRules.length + unclearRules.length}
                </Badge>
              </div>
              <div className={spacing.itemGap}>
                {missingRules.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 p-2 bg-red-50/50 rounded border border-red-100">
                    <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={cn(textStyles.body, "text-red-800")}>{r.rule}</p>
                      <p className={cn(textStyles.label, "mt-0.5 normal-case tracking-normal")}>Missing</p>
                    </div>
                  </div>
                ))}
                {unclearRules.map((r) => (
                  <div key={r.id} className="flex items-start gap-2 p-2 bg-amber-50/50 rounded border border-amber-100">
                    <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className={cn(textStyles.body, "text-amber-800")}>{r.rule}</p>
                      <p className={cn(textStyles.label, "mt-0.5 normal-case tracking-normal")}>Unclear</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical course (read-only) */}
        <Card className={containerStyles.card}>
          <CardContent className={spacing.cardPadding}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span className={textStyles.sectionHeader}>Clinical course</span>
            </div>
            <p className={cn(textStyles.body, "leading-relaxed")}>{currentCase.clinicalCourse}</p>
          </CardContent>
        </Card>

        {/* Decision notes */}
        <Card className={containerStyles.card}>
          <CardContent className={spacing.cardPadding}>
            <label htmlFor="physician-notes" className={cn(textStyles.label, "mb-1.5 block")}>
              Decision notes (optional)
            </label>
            <Textarea
              id="physician-notes"
              placeholder="Add reasoning for your decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-[11px] min-h-[60px] resize-none"
              disabled={!!actionTaken}
            />
          </CardContent>
        </Card>
      </div>

      {/* Sticky action bar - 3 buttons only */}
      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-auto">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className={textStyles.body}>
              Assigned by {currentCase.workflow.assignment?.assignedTo || "System"}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEscalate}
            disabled={!!actionTaken}
            className="h-8 text-[11px] gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <AlertTriangle className="h-3 w-3" />
            Escalate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDefer}
            disabled={!!actionTaken}
            className="h-8 text-[11px] gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
          >
            <Clock className="h-3 w-3" />
            Defer
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={!!actionTaken}
            className="h-8 text-[11px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle className="h-3 w-3" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  )
}
