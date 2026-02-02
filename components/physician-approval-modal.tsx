"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Clock, 
  User,
  ArrowUpCircle,
  Shield,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Patient } from "@/lib/types"

interface PhysicianApprovalModalProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onApprove: (notes?: string) => void
  onDefer: (notes?: string) => void
  onEscalate: (notes?: string) => void
}

export function PhysicianApprovalModal({
  patient,
  isOpen,
  onClose,
  onApprove,
  onDefer,
  onEscalate,
}: PhysicianApprovalModalProps) {
  const [notes, setNotes] = useState("")
  const [selectedAction, setSelectedAction] = useState<"approve" | "defer" | "escalate" | null>(null)

  const { careLens, workflow } = patient
  const highRisks = careLens.riskFactors.filter(r => r.severity === "High" && r.status === "open")
  const openGaps = careLens.policyGaps.filter(g => g.status === "open")
  const satisfiedRules = patient.payerRules.filter(r => r.status === "satisfied").length
  const totalRules = patient.payerRules.length

  const handleAction = () => {
    if (selectedAction === "approve") {
      onApprove(notes)
    } else if (selectedAction === "defer") {
      onDefer(notes)
    } else if (selectedAction === "escalate") {
      onEscalate(notes)
    }
    setNotes("")
    setSelectedAction(null)
    onClose()
  }

  const canApprove = highRisks.length === 0 && openGaps.length === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            Physician Review: {patient.name}
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            Review the case summary and CareLens analysis, then make your decision.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Patient Summary Card */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14px] font-semibold text-slate-800">{patient.name}</h3>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {patient.age}yo {patient.gender === "F" ? "Female" : "Male"} | MRN: {patient.mrn} | {patient.insurance}
                </p>
                <p className="text-[12px] text-slate-500">
                  Admitted: {patient.admissionDate} | LOS: {patient.lengthOfStay}
                </p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-md text-[11px] font-medium",
                patient.urgency === "STAT" ? "bg-red-100 text-red-700" :
                patient.urgency === "URGENT" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"
              )}>
                {patient.urgency}
              </div>
            </div>

            {/* Primary Diagnosis */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Primary Diagnosis</p>
              <p className="text-[13px] font-medium text-slate-800 mt-1">
                {patient.problemList.find(p => p.type === "primary")?.name || patient.diagnoses[0]}
              </p>
            </div>
          </div>

          {/* CareLens Summary */}
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-blue-600" />
              <h4 className="text-[13px] font-semibold text-slate-800">CareLens Analysis</h4>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Confidence */}
              <div className="text-center p-3 rounded-md bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
                <p className={cn(
                  "text-[18px] font-bold mt-1",
                  careLens.overallConfidence === "High" ? "text-emerald-600" :
                  careLens.overallConfidence === "Medium" ? "text-amber-600" : "text-red-600"
                )}>
                  {careLens.overallConfidence}
                </p>
              </div>

              {/* Denial Risk */}
              <div className="text-center p-3 rounded-md bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase">Denial Risk</p>
                <p className={cn(
                  "text-[18px] font-bold mt-1",
                  careLens.denialRisk === "Low" ? "text-emerald-600" :
                  careLens.denialRisk === "Medium" ? "text-amber-600" : "text-red-600"
                )}>
                  {careLens.denialRisk}
                </p>
              </div>

              {/* Rules Satisfied */}
              <div className="text-center p-3 rounded-md bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase">Payer Rules</p>
                <p className="text-[18px] font-bold mt-1 text-slate-700">
                  {satisfiedRules}/{totalRules}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span>Case Progress</span>
                <span>{workflow.progressPercent}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    workflow.progressPercent >= 80 ? "bg-emerald-500" :
                    workflow.progressPercent >= 50 ? "bg-amber-500" : "bg-slate-400"
                  )}
                  style={{ width: `${workflow.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Issues Section - Why Approval is Blocked */}
          {(highRisks.length > 0 || openGaps.length > 0) && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-4 w-4 text-red-600" />
                <h4 className="text-[13px] font-semibold text-red-800">Blocking Approval</h4>
              </div>
              <p className="text-[11px] text-red-700 mb-3">
                The following issues must be resolved before this case can be approved:
              </p>

              {highRisks.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-medium text-red-700 uppercase mb-2">High Risk Factors ({highRisks.length})</p>
                  <ul className="space-y-1.5">
                    {highRisks.map(risk => (
                      <li key={risk.id} className="text-[11px] text-red-800 flex items-start gap-2 bg-red-100/50 rounded px-2 py-1.5">
                        <AlertTriangle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{risk.factor}</span>
                          {risk.mitigationSuggestion && (
                            <p className="text-[10px] text-red-600 mt-0.5">Fix: {risk.mitigationSuggestion}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {openGaps.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-amber-700 uppercase mb-2">Policy Gaps ({openGaps.length})</p>
                  <ul className="space-y-1.5">
                    {openGaps.map(gap => (
                      <li key={gap.id} className="text-[11px] text-amber-800 flex items-start gap-2 bg-amber-100/50 rounded px-2 py-1.5">
                        <FileText className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{gap.gap}</span>
                          <p className="text-[10px] text-amber-600 mt-0.5">Required: {gap.requirement}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="text-[10px] text-red-600">
                  <strong>Options:</strong> Defer this case back to the Case Manager for documentation updates, or escalate to Medical Director for complex clinical decisions.
                </p>
              </div>
            </div>
          )}

          {/* Physician Responsibilities */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <h4 className="text-[13px] font-semibold text-blue-800">Your Review Validates</h4>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-medium text-blue-800">Medical Necessity</span>
                  <p className="text-[10px] text-blue-600">Treatment is clinically appropriate and necessary for patient care</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-medium text-blue-800">Clinical Accuracy</span>
                  <p className="text-[10px] text-blue-600">Documentation accurately reflects the patient's clinical condition</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11px] font-medium text-blue-800">Treatment Appropriateness</span>
                  <p className="text-[10px] text-blue-600">Care plan follows evidence-based guidelines and payer requirements</p>
                </div>
              </li>
            </ul>
          </div>

          {/* 2-Minute Safe Approve Path - High Confidence Cases */}
          {canApprove && careLens.overallConfidence === "High" && (
            <div className="rounded-lg border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-emerald-800">Everything needed for safe approval is documented</p>
                  <p className="text-[11px] text-emerald-600 mt-1">
                    CareLens confidence is high, all {totalRules} payer criteria are met, and no blocking risks remain.
                    Your clinical judgment is preserved in the full review below.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] h-9"
                      onClick={() => {
                        onApprove("Quick approval - all criteria met, high confidence")
                        onClose()
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Approve & Next Case
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-[11px] h-9 text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-transparent"
                      onClick={() => setSelectedAction("approve")}
                    >
                      Review details anyway
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-emerald-600 mt-3 pt-3 border-t border-emerald-200">
                Designed for your 2-minute review workflow. CareLens has verified documentation completeness so you can focus on clinical judgment.
              </p>
            </div>
          )}

          {/* Standard Ready indicator for non-high-confidence */}
          {canApprove && careLens.overallConfidence !== "High" && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-[13px] font-semibold text-emerald-800">Ready for Approval</p>
                  <p className="text-[11px] text-emerald-600">All high-risk factors resolved and policy gaps closed. Confidence is {careLens.overallConfidence} - review recommended.</p>
                </div>
              </div>
            </div>
          )}

          {/* Decision Buttons */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium text-slate-500 uppercase">Select Your Decision</p>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Approve */}
              <button
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedAction === "approve"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50",
                  !canApprove && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => canApprove && setSelectedAction("approve")}
                disabled={!canApprove}
              >
                <CheckCircle2 className={cn(
                  "h-8 w-8 mx-auto mb-2",
                  selectedAction === "approve" ? "text-emerald-600" : "text-slate-400"
                )} />
                <p className="text-[13px] font-semibold text-slate-800">Approve</p>
                <p className="text-[10px] text-slate-500 mt-1">Ready for PA submission</p>
              </button>

              {/* Defer */}
              <button
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedAction === "defer"
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                )}
                onClick={() => setSelectedAction("defer")}
              >
                <Clock className={cn(
                  "h-8 w-8 mx-auto mb-2",
                  selectedAction === "defer" ? "text-amber-600" : "text-slate-400"
                )} />
                <p className="text-[13px] font-semibold text-slate-800">Defer</p>
                <p className="text-[10px] text-slate-500 mt-1">Needs more documentation</p>
              </button>

              {/* Escalate */}
              <button
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedAction === "escalate"
                    ? "border-purple-500 bg-purple-50"
                    : "border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                )}
                onClick={() => setSelectedAction("escalate")}
              >
                <ArrowUpCircle className={cn(
                  "h-8 w-8 mx-auto mb-2",
                  selectedAction === "escalate" ? "text-purple-600" : "text-slate-400"
                )} />
                <p className="text-[13px] font-semibold text-slate-800">Escalate</p>
                <p className="text-[10px] text-slate-500 mt-1">Send to Medical Director</p>
              </button>
            </div>
          </div>

          {/* Notes */}
          {selectedAction && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-[12px] text-slate-600">
                {selectedAction === "approve" ? "Approval Notes (Optional)" :
                 selectedAction === "defer" ? "Reason for Deferral (Required)" :
                 "Reason for Escalation (Required)"}
              </Label>
              <Textarea
                id="notes"
                placeholder={
                  selectedAction === "approve" ? "Add any notes for the case file..." :
                  selectedAction === "defer" ? "Describe what additional documentation is needed..." :
                  "Explain why this case needs Medical Director review..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-[12px] min-h-[80px]"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="text-[12px] bg-transparent">
            Cancel
          </Button>
          <Button 
            onClick={handleAction}
            disabled={!selectedAction || (selectedAction !== "approve" && !notes.trim())}
            className={cn(
              "text-[12px]",
              selectedAction === "approve" && "bg-emerald-600 hover:bg-emerald-700",
              selectedAction === "defer" && "bg-amber-600 hover:bg-amber-700",
              selectedAction === "escalate" && "bg-purple-600 hover:bg-purple-700",
            )}
          >
            {selectedAction === "approve" ? "Approve for Submission" :
             selectedAction === "defer" ? "Defer Case" :
             selectedAction === "escalate" ? "Escalate to Director" :
             "Select an Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
