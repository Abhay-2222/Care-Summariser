"use client"

import { useEffect, useRef } from "react"
import { AppHeader } from "@/components/app-header"
import { PatientListPanel } from "@/components/patient-list-panel"
import { ClinicalSummaryView } from "@/components/clinical-summary-view"
import { useApp } from "@/lib/app-context"

function CaseManagerHome() {
  const { patients, setSelectedPatientId, selectedPatient, currentRole } = useApp()
  const pickedRole = useRef<string | null>(null)

  useEffect(() => {
    if (pickedRole.current === currentRole) return
    pickedRole.current = currentRole
    const due = patients.find(
      (patient) =>
        !!patient.paDeadline &&
        (patient.paDeadline.hoursRemaining <= 24 || patient.paDeadline.status === "overdue"),
    )
    const forPhysician = patients.find((patient) => patient.workflow.status === "needs_physician")
    const first = currentRole === "physician" ? (forPhysician ?? patients[0]) : (due ?? patients[0])
    if (first) setSelectedPatientId(first.id)
  }, [patients, setSelectedPatientId, currentRole])

  return (
    <div className="flex flex-1 overflow-hidden">
      <PatientListPanel />
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {selectedPatient ? (
          <ClinicalSummaryView />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-body-sm text-[var(--neutral-500)]">Nothing in the queue.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <CaseManagerHome />
    </div>
  )
}
