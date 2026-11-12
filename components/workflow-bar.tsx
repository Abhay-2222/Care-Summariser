"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { statusConfig, requirementsMet, rulesMet, unmetRequirements, formatDeadline } from "@/lib/workflow-utils"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { typography } from "@/lib/design-system"
import {
  Send,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

interface WorkflowBarProps {
  onRequestDocs?: () => void
  onSendToMD?: () => void
  onGeneratePA?: () => void
  onSubmit?: () => void
}

function formatSince(iso?: string) {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

export function WorkflowBar({
  onRequestDocs,
  onSendToMD,
  onGeneratePA,
  onSubmit,
}: WorkflowBarProps) {
  const {
    selectedPatient,
    patients,
    hasPermission,
    claimCase,
    physicianApprove,
    physicianDefer,
    physicianEscalate,
    restorePatient,
    setSelectedPatientId,
  } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [reason, setReason] = useState("")

  if (!selectedPatient) return null

  const workflow = selectedPatient.workflow
  const statusInfo = statusConfig[workflow.status]
  const met = rulesMet(selectedPatient)
  const total = selectedPatient.payerRules.length
  const gaps = unmetRequirements(selectedPatient)
  const isPhysician = hasPermission("approve_pa")
  const isCaseManager = hasPermission("claim_case")
  const physicianTurn = workflow.status === "needs_physician" || workflow.status === "escalated"

  const advance = () => {
    const next =
      patients.find((patient) => patient.id !== selectedPatient.id && patient.workflow.status === "needs_physician") ??
      patients.find((patient) => patient.id !== selectedPatient.id)
    if (!next) return
    setSelectedPatientId(next.id)
    if (pathname.startsWith("/patient")) router.push(`/patient/${next.id}`)
    setReason("")
  }

  const decide = (label: string, run: () => void) => {
    const snapshot = structuredClone(selectedPatient)
    run()
    toast({
      title: label,
      description: snapshot.name,
      action: (
        <ToastAction
          altText="Undo"
          onClick={() => {
            restorePatient(snapshot)
            setSelectedPatientId(snapshot.id)
            if (pathname.startsWith("/patient")) router.push(`/patient/${snapshot.id}`)
          }}
        >
          Undo
        </ToastAction>
      ),
    })
    advance()
  }

  const signOff = () => {
    if (!requirementsMet(selectedPatient)) return
    decide("Signed off", () => physicianApprove(selectedPatient.id, reason))
  }

  const sendBack = () => {
    if (!reason.trim()) return
    decide("Sent back", () => physicianDefer(selectedPatient.id, reason))
  }

  const escalate = () => {
    if (!reason.trim()) return
    decide("Escalated", () => physicianEscalate(selectedPatient.id, reason))
  }

  const due = selectedPatient.paDeadline ? formatDeadline(selectedPatient.paDeadline.hoursRemaining) : ""
  const overdue = selectedPatient.paDeadline?.status === "overdue"
  const highRisk = selectedPatient.careLens.denialRisk === "High"

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="min-w-0 text-body text-[var(--neutral-800)]">
          <span className={workflow.status === "escalated" ? "text-[var(--status-error-text)]" : statusInfo.badgeClass}>{statusInfo.label}</span>
          {` · ${met} of ${total} requirements met`}
          {due && <span className={overdue ? "text-[var(--status-error-text)]" : ""}>{` · ${due}`}</span>}
        </p>
        {isCaseManager && workflow.status === "new" && (
          <Button size="sm" className="h-7 px-3 text-body" onClick={() => claimCase(selectedPatient.id)}>
            Claim
          </Button>
        )}
        {isCaseManager && workflow.status === "in_progress" && hasPermission("send_to_physician") && (
          <Button size="sm" variant="outline" className="h-7 px-2 sm:px-3 text-body gap-1.5 bg-transparent" onClick={onSendToMD}>
            <UserCheck className="h-3.5 w-3.5" />
            Send for sign-off
          </Button>
        )}
        {isCaseManager && workflow.status === "ready" && hasPermission("submit_pa") && (
          <Button size="sm" className="h-7 px-2 sm:px-3 text-body gap-1.5" onClick={onSubmit}>
            <Send className="h-3.5 w-3.5" />
            Send to {selectedPatient.insurance}
          </Button>
        )}
      </div>
      {highRisk && (
        <p className="mt-1 flex items-center gap-1 text-body text-[var(--neutral-800)]">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          High risk
        </p>
      )}
      {isPhysician && physicianTurn && (
        <div className="mt-3 border-t border-border pt-3">
          <label className="block max-w-md">
            <span className={typography.meta}>Reason</span>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              aria-label="Reason, required for Send back and Escalate"
              placeholder="Required for Send back and Escalate"
              className="focus-ring mt-1 h-7 w-full rounded-md border border-border bg-card px-2 text-body"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="h-7 px-3 text-body gap-1.5"
              disabled={!requirementsMet(selectedPatient)}
              onClick={signOff}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sign off
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-3 text-body bg-transparent" disabled={!reason.trim()} onClick={sendBack}>
              Send back
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-3 text-body bg-transparent" disabled={!reason.trim()} onClick={escalate}>
              Escalate
            </Button>
          </div>
          {gaps.length > 0 && (
            <div className="mt-3">
              <p className="text-meta text-[var(--status-error-text)]">Missing</p>
              <ul className="mt-1 space-y-1">
                {gaps.map((gap) => (
                  <li key={gap} className="text-body text-[var(--status-error-text)]">{gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
