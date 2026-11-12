"use client"

import { cn } from "@/lib/utils"
import { typography } from "@/lib/design-system"
import type { Patient } from "@/lib/types"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PatientObjectCardProps {
  patient: Patient
  showPHI?: boolean
  onTogglePHI?: () => void
  className?: string
}

/**
 * Unified Patient Object Card
 * 
 * Consolidates all patient info into 3 dense rows:
 * Row 1: Name · Demographics · Insurance
 * Row 2: Location · Clinical Info (LOS, Admitted, Docs, Risk)
 * Row 3: Urgency Badge + Primary Diagnosis
 * 
 * Desktop-first: Horizontal layout prioritized
 * All info visible at-a-glance (no hover/click required)
 */
export function PatientObjectCard({ 
  patient, 
  showPHI = true, 
  onTogglePHI,
  className 
}: PatientObjectCardProps) {
  const primaryDiagnosis = patient.problemList.find(p => p.type === "primary")
  const urgencyWord = patient.urgency === "STAT" ? "STAT" : patient.urgency === "URGENT" ? "Urgent" : "Routine"

  return (
    <div className={cn("group/identity min-w-0", className)}>
      <h2 className="flex items-baseline gap-2">
        <span className="text-title text-[var(--neutral-900)]">{showPHI ? patient.name : "********"}</span>
        <span className="text-meta text-[var(--neutral-500)]">{patient.age} {patient.gender}</span>
        <span className={cn("text-meta", patient.urgency === "STAT" ? "text-[var(--status-error-text)]" : "text-[var(--neutral-600)]")}>{urgencyWord}</span>
        {onTogglePHI && (
          <Button
            variant="ghost"
            size="sm"
            className="focus-ring h-5 w-5 p-0 opacity-0 group-hover/identity:opacity-100 group-focus-within/identity:opacity-100"
            aria-label={showPHI ? "Hide patient details" : "Show patient details"}
            onClick={onTogglePHI}
          >
            {showPHI ? (
              <EyeOff className="h-3 w-3 text-[var(--neutral-500)]" />
            ) : (
              <Eye className="h-3 w-3 text-[var(--neutral-500)]" />
            )}
          </Button>
        )}
      </h2>
      <p className="mt-2 text-body text-[var(--neutral-800)]">{primaryDiagnosis?.name ?? "None recorded"}</p>
      <p className="mt-1 text-meta text-[var(--neutral-500)]">
        {showPHI ? patient.mrn : "********"} · {patient.insurance} · Admitted {patient.admissionDate}
      </p>
    </div>
  )
}

/**
 * Compact variant for mobile or narrow spaces
 * Stacks rows vertically but keeps ALL info visible
 */
export function PatientObjectCardCompact({ 
  patient, 
  showPHI = true, 
  onTogglePHI,
  className 
}: PatientObjectCardProps) {
  const maskPHI = (value: string) => (showPHI ? value : "********")
  const primaryDiagnosis = patient.problemList.find(p => p.type === "primary")

  return (
    <div className={cn("bg-card rounded-xl border border-border p-3 shadow-ds-xs", className)}>
      {/* Row 1: Name + Urgency */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-patient-name truncate">
          {patient.name}
        </h2>
        <span className={cn(
          "text-caption flex-shrink-0",
          patient.urgency === "STAT" ? "text-[var(--status-error-text)]" : "text-[var(--neutral-600)]"
        )}>
          {patient.urgency === "STAT" ? "STAT" : patient.urgency === "URGENT" ? "Urgent" : "Routine"}
        </span>
      </div>

      {/* Row 2: Demographics */}
      <div className={cn(typography.body, "mt-1")}>
        {patient.age}yo {patient.gender} · MRN: {maskPHI(patient.mrn)} · {patient.insurance}
      </div>

      {/* Row 3: Location + Clinical */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
        <span className={typography.body}>Room {patient.room}</span>
        <span className={typography.body}>LOS: {patient.lengthOfStay}</span>
        <span className={cn(
          "text-caption",
          patient.careLens.denialRisk === "High" ? "text-[var(--status-error-text)]" : "text-[var(--neutral-600)]"
        )}>
          Denial risk {patient.careLens.denialRisk}
        </span>
      </div>

      {/* Row 4: Primary Diagnosis */}
      {primaryDiagnosis && (
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
          <span className={typography.body}>
            {primaryDiagnosis.name}
          </span>
          <span className="text-caption text-[var(--neutral-500)]">
            {primaryDiagnosis.icdCode}
          </span>
        </div>
      )}
    </div>
  )
}
