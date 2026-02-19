"use client"

import { useState, useMemo } from "react"
import { useApp } from "@/lib/app-context"
import { textStyles, statusBadgeStyles, statusLabels, containerStyles, spacing } from "@/lib/design-system"
import { cn } from "@/lib/utils"
import type { Patient, CaseStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Eye,
  FileText,
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  History,
} from "lucide-react"

export function AuditorLayout() {
  const { patients, getAuditStats, auditLog } = useApp()
  const stats = getAuditStats()
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "ALL">("ALL")
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)

  const filteredPatients = useMemo(() => {
    if (statusFilter === "ALL") return patients
    return patients.filter((p) => p.workflow.status === statusFilter)
  }, [patients, statusFilter])

  const selectedCase = patients.find((p) => p.id === selectedCaseId) || null

  // Get audit log entries for a specific patient
  const getCaseAuditEntries = (patientId: string) => {
    const patientEntries = auditLog.filter((e) => e.patientId === patientId)
    const caseEntries = patients.find((p) => p.id === patientId)?.careLens.auditTrail || []
    return [...patientEntries, ...caseEntries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  const statusFilters: (CaseStatus | "ALL")[] = [
    "ALL", "new", "in_progress", "needs_physician", "ready", "submitted", "approved", "denied", "appealing",
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-[var(--neutral-600)]" />
          <span className={cn(textStyles.title, "text-foreground")}>Audit Dashboard</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <StatCard label="Total cases" value={stats.totalCases} />
          <StatCard label="Approval rate" value={`${stats.approvalRate}%`} color="emerald" />
          <StatCard label="Denial rate" value={`${stats.denialRate}%`} color="red" />
          <StatCard label="Avg processing" value={stats.avgProcessingTime} />
          <StatCard label="Pending MD" value={stats.pendingPhysician} color="amber" />
          <StatCard label="Ready to submit" value={stats.readyForSubmission} color="blue" />
          <StatCard label="Audit entries" value={auditLog.length} />
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-2 border-b border-border bg-[var(--neutral-50)]/50 flex items-center gap-2 overflow-x-auto">
        <Filter className="h-3 w-3 text-[var(--neutral-400)] flex-shrink-0" />
        {statusFilters.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={cn(
              "text-[10px] px-2 py-1 rounded-full border whitespace-nowrap transition-colors",
              statusFilter === status
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-card text-[var(--neutral-500)] border-border hover:border-slate-300"
            )}
          >
            {status === "ALL" ? "All" : statusLabels[status] || status}
          </button>
        ))}
      </div>

      {/* Case table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--neutral-50)] z-10">
            <tr className="border-b border-border">
              <th className={cn(textStyles.label, "text-left px-4 py-2")}>Patient</th>
              <th className={cn(textStyles.label, "text-left px-4 py-2")}>Status</th>
              <th className={cn(textStyles.label, "text-left px-4 py-2 hidden md:table-cell")}>Assigned to</th>
              <th className={cn(textStyles.label, "text-left px-4 py-2 hidden lg:table-cell")}>Risk</th>
              <th className={cn(textStyles.label, "text-left px-4 py-2 hidden lg:table-cell")}>Last update</th>
              <th className={cn(textStyles.label, "text-left px-4 py-2")}>Trail</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => {
              const workflow = patient.workflow
              const statusStyle = statusBadgeStyles[workflow.status] || ""
              const statusLabel = statusLabels[workflow.status] || workflow.status
              const trailCount = getCaseAuditEntries(patient.id).length

              return (
                <tr
                  key={patient.id}
                  className="border-b border-border hover:bg-[var(--neutral-50)]/50 transition-colors"
                >
                  <td className="px-4 py-2">
                    <p className={textStyles.title}>{patient.name}</p>
                    <p className={textStyles.body}>{patient.mrn}</p>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0", statusStyle)}>
                      {statusLabel}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    <p className={textStyles.body}>
                      {workflow.assignment?.assignedTo || "Unassigned"}
                    </p>
                  </td>
                  <td className="px-4 py-2 hidden lg:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0",
                        patient.careLens.denialRisk === "High" && "bg-red-50 text-red-600 border-red-200",
                        patient.careLens.denialRisk === "Medium" && "bg-amber-50 text-amber-600 border-amber-200",
                        patient.careLens.denialRisk === "Low" && "bg-emerald-50 text-[var(--success)] border-emerald-200"
                      )}
                    >
                      {patient.careLens.denialRisk}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 hidden lg:table-cell">
                    <p className={textStyles.body}>{workflow.lastUpdated ? new Date(workflow.lastUpdated).toLocaleDateString() : "-"}</p>
                  </td>
                  <td className="px-4 py-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] gap-1"
                          onClick={() => setSelectedCaseId(patient.id)}
                        >
                          <History className="h-3 w-3" />
                          {trailCount}
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[360px] sm:w-[420px]">
                        <SheetHeader>
                          <SheetTitle className={cn(textStyles.title, "text-[13px]")}>
                            Audit Trail: {patient.name}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
                          {getCaseAuditEntries(patient.id).length === 0 ? (
                            <p className={cn(textStyles.body, "text-center py-8 text-[var(--neutral-400)]")}>
                              No audit entries yet.
                            </p>
                          ) : (
                            getCaseAuditEntries(patient.id).map((entry) => (
                              <div
                                key={entry.id}
                                className={cn(containerStyles.card, spacing.cardPaddingCompact, "flex items-start gap-2")}
                              >
                                <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileText className="h-2.5 w-2.5 text-[var(--neutral-500)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className={cn(textStyles.body, "font-medium text-foreground")}>{entry.action}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={textStyles.label}>{entry.user}</span>
                                    {entry.role && (
                                      <Badge variant="outline" className="text-[8px] px-1 py-0 border-border text-[var(--neutral-500)]">
                                        {entry.role}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={cn(textStyles.label, "mt-0.5 normal-case tracking-normal")}>{entry.timestamp}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </SheetContent>
                    </Sheet>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredPatients.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Eye className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className={cn(textStyles.body, "text-[var(--neutral-400)]")}>No cases match this filter.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: "emerald" | "red" | "amber" | "blue"
}) {
  return (
    <div className={cn(containerStyles.card, "p-2 text-center")}>
      <p className={textStyles.label}>{label}</p>
      <p
        className={cn(
          "text-[14px] font-mono tabular-nums",
          color === "emerald" && "text-[var(--success)]",
          color === "red" && "text-red-600",
          color === "amber" && "text-amber-600",
          color === "blue" && "text-[var(--brand-500)]",
          !color && "text-slate-800"
        )}
      >
        {value}
      </p>
    </div>
  )
}
