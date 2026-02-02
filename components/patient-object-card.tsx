"use client"

import { cn } from "@/lib/utils"
import { 
  typography, 
  statusBadgeStyles, 
  confidenceStyles,
  riskStyles,
} from "@/lib/design-system"
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
  
  // Urgency badge style
  const urgencyStyle = statusBadgeStyles[patient.urgency]
  
  // Risk style
  const riskStyle = riskStyles[patient.careLens.denialRisk]
  
  // Confidence style
  const confidenceStyle = confidenceStyles[patient.careLens.overallConfidence]

  return (
    <div className={cn("bg-white rounded-lg border border-slate-100 p-3", className)}>
      {/* Row 1: Name · Demographics · Insurance */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2 className={cn(typography.title, "text-[13px] truncate")}>
            {patient.name}
          </h2>
          <span className={typography.body}>·</span>
          <span className={typography.body}>
            {patient.age}yo {patient.gender}
          </span>
          <span className={typography.body}>·</span>
          <span className={typography.body}>
            MRN: {maskPHI(patient.mrn)}
          </span>
          <span className={typography.body}>·</span>
          <span className={cn(typography.body, "truncate")}>
            {patient.insurance}
          </span>
        </div>
        
        {/* PHI Toggle + Confidence */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={cn(
            "px-2 py-0.5 rounded text-[9px] font-medium",
            confidenceStyle
          )}>
            {patient.careLens.overallConfidence} Confidence
          </span>
          {onTogglePHI && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onTogglePHI}
            >
              {showPHI ? (
                <EyeOff className="h-3 w-3 text-slate-400" />
              ) : (
                <Eye className="h-3 w-3 text-slate-400" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Row 2: Location · Clinical Info */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1">
          <span className={typography.label}>Room</span>
          <span className={typography.body}>{patient.room}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={typography.label}>LOS</span>
          <span className={typography.body}>{patient.lengthOfStay}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={typography.label}>Admitted</span>
          <span className={typography.body}>{patient.admissionDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={typography.label}>Docs</span>
          <span className={typography.body}>{patient.documentsProcessed}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={typography.label}>Risk</span>
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-medium",
            riskStyle
          )}>
            {patient.careLens.denialRisk}
          </span>
        </div>
      </div>

      {/* Row 3: Urgency Badge + Primary Diagnosis */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100">
        <span className={cn(
          "px-2 py-0.5 rounded text-[9px] font-semibold flex-shrink-0",
          urgencyStyle
        )}>
          {patient.urgency}
        </span>
        {primaryDiagnosis && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={cn(typography.title, "truncate")}>
              {primaryDiagnosis.name}
            </span>
            <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
              {primaryDiagnosis.icdCode}
            </span>
          </div>
        )}
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
  const urgencyStyle = statusBadgeStyles[patient.urgency]
  const riskStyle = riskStyles[patient.careLens.denialRisk]

  return (
    <div className={cn("bg-white rounded-lg border border-slate-100 p-3", className)}>
      {/* Row 1: Name + Urgency */}
      <div className="flex items-center justify-between gap-2">
        <h2 className={cn(typography.title, "text-[13px] truncate")}>
          {patient.name}
        </h2>
        <span className={cn(
          "px-2 py-0.5 rounded text-[9px] font-semibold flex-shrink-0",
          urgencyStyle
        )}>
          {patient.urgency}
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
        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium", riskStyle)}>
          {patient.careLens.denialRisk} Risk
        </span>
      </div>

      {/* Row 4: Primary Diagnosis */}
      {primaryDiagnosis && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span className={cn(typography.title, "text-[11px]")}>
            {primaryDiagnosis.name}
          </span>
          <span className="ml-2 text-[9px] font-mono text-blue-600">
            {primaryDiagnosis.icdCode}
          </span>
        </div>
      )}
    </div>
  )
}
