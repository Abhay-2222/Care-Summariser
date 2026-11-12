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
  const maskPHI = (value: string) => (showPHI ? value : "********")
  
  // Get primary diagnosis
  const primaryDiagnosis = patient.problemList.find(p => p.type === "primary")

  return (
    <div className={cn("min-w-0", className)}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-[auto_auto_minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <p className={typography.meta}>Patient</p>
          <h2 className="mt-1 flex items-center gap-2 whitespace-nowrap">
            <span className={typography.name}>{patient.name}</span>
            <span className={typography.meta}>{patient.age} {patient.gender}</span>
            {onTogglePHI && (
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={onTogglePHI}>
                {showPHI ? (
                  <EyeOff className="h-3 w-3 text-[var(--neutral-400)]" />
                ) : (
                  <Eye className="h-3 w-3 text-[var(--neutral-400)]" />
                )}
              </Button>
            )}
          </h2>
        </div>
        <div className="min-w-0">
          <p className={typography.meta}>Insurance</p>
          <p className={cn(typography.body, "mt-1 whitespace-nowrap")}>{patient.insurance}</p>
        </div>
        <div className="min-w-0">
          <p className={typography.meta}>Case</p>
          <p className={cn(typography.body, "mt-1 truncate")}>
            {maskPHI(patient.mrn)}
            <span className={typography.meta}> · {patient.admissionDate}</span>
            {patient.urgency === "STAT" && (
              <span className="text-[var(--status-error-text)]"> · STAT</span>
            )}
          </p>
        </div>
        <div>
          <p className={typography.meta}>Risk</p>
          <p className={cn(
            typography.body,
            "mt-1 whitespace-nowrap",
            patient.careLens.denialRisk === "High" && "text-[var(--status-error-text)]"
          )}>
            {patient.careLens.denialRisk}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className={cn(typography.meta, "shrink-0")}>Diagnosis</p>
        <p className={typography.body}>{primaryDiagnosis?.name ?? "None recorded"}</p>
      </div>
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
