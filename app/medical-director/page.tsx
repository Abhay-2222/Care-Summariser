"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/app-context"
import { requirementsMet } from "@/lib/workflow-utils"
import { statusLabels } from "@/lib/design-system"

export default function MedicalDirectorPage() {
  const { patients, physicianApprove, physicianDefer } = useApp()
  const escalated = patients.filter((patient) => patient.workflow.status === "escalated")
  const [selectedId, setSelectedId] = useState<string | null>(escalated[0]?.id ?? null)
  const [reason, setReason] = useState("")
  const selected = escalated.find((patient) => patient.id === selectedId) ?? escalated[0] ?? null
  const canSignOff = selected ? requirementsMet(selected) : false

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 overflow-hidden">
        <aside className="w-full max-w-sm border-r border-border overflow-y-auto">
          <div className="px-4 py-3 border-b border-border">
            <h1 className="text-heading-sm text-foreground">Escalated cases</h1>
            <p className="text-caption text-[var(--neutral-500)]">{escalated.length} undecided</p>
          </div>
          {escalated.length === 0 ? (
            <p className="p-4 text-body-sm text-[var(--neutral-500)]">No escalated cases.</p>
          ) : (
            escalated.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => {
                  setSelectedId(patient.id)
                  setReason("")
                }}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-[var(--neutral-50)] ${
                  selected?.id === patient.id ? "bg-[var(--neutral-50)]" : ""
                }`}
              >
                <p className="text-label-md text-foreground">{patient.name}</p>
                <p className="text-caption text-[var(--neutral-500)]">{patient.mrn}</p>
                <p className="text-caption text-[var(--neutral-600)] mt-1">
                  {patient.workflow.physicianDecision?.notes || "No reason recorded"}
                </p>
              </button>
            ))
          )}
        </aside>
        <section className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <p className="text-body-sm text-[var(--neutral-500)]">No escalated cases.</p>
          ) : (
            <div className="max-w-2xl flex flex-col gap-4">
              <div>
                <p className="text-caption text-[var(--neutral-500)]">{statusLabels.escalated}</p>
                <h2 className="text-heading-lg text-foreground">{selected.name}</h2>
                <p className="text-body-sm text-[var(--neutral-600)]">{selected.chiefComplaint}</p>
              </div>
              <div>
                <p className="text-caption text-[var(--neutral-500)]">Why it was escalated</p>
                <p className="text-body-sm text-foreground">
                  {selected.workflow.physicianDecision?.notes || "No reason recorded"}
                </p>
                <p className="text-caption text-[var(--neutral-500)] mt-1">
                  {selected.workflow.physicianDecision?.decidedBy}
                </p>
              </div>
              <div>
                <p className="text-caption text-[var(--neutral-500)] mb-1">Requirements</p>
                <ul className="flex flex-col gap-1">
                  {selected.payerRules.map((rule) => (
                    <li key={rule.id} className="text-body-sm text-foreground">
                      {rule.status === "satisfied" ? "Met" : rule.status === "missing" ? "Missing" : "Unclear"}
                      {" · "}
                      {rule.rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label htmlFor="md-reason" className="text-caption text-[var(--neutral-500)]">
                  Reason
                </label>
                <Textarea
                  id="md-reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Required to send the case back"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={!canSignOff}
                  onClick={() => {
                    physicianApprove(selected.id, reason || undefined)
                    setReason("")
                  }}
                >
                  Sign off
                </Button>
                <Button
                  variant="outline"
                  disabled={!reason.trim()}
                  onClick={() => {
                    physicianDefer(selected.id, reason)
                    setReason("")
                    setSelectedId(null)
                  }}
                >
                  Do not submit
                </Button>
              </div>
              {!canSignOff && (
                <p className="text-caption text-[var(--neutral-500)]">
                  Sign off stays off until every requirement is met.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
