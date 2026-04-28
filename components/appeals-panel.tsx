"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { typography } from "@/lib/design-system"

const statusFilters = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
]

const mockAppeals = [
  {
    id: "1",
    caseNumber: "APP-2026-00142",
    status: "Pending Review",
    submittedDate: "Jan 3, 2026",
    reason: "Initial denial - insufficient medical necessity documentation",
    nextStep: "Submit additional clinical notes",
    dueDate: "Jan 10, 2026",
  },
  {
    id: "2",
    caseNumber: "APP-2025-09887",
    status: "Approved",
    submittedDate: "Dec 15, 2025",
    reason: "Denial of extended stay",
    nextStep: "None - case resolved",
    dueDate: "-",
  },
]

export function AppealsPanel() {
  const { selectedPatient } = useApp()
  const [statusFilter, setStatusFilter] = useState("all")

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    )
  }

  return (
    <div className="p-4">
        <div className="bg-card rounded-lg border border-border">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2.5">
            <p className={cn(typography.sectionHeader, "text-[var(--neutral-500)]")}>APPEALS MANAGEMENT</p>
            <Button size="sm" className="gap-1.5 text-label-sm h-7">
              <FileText className="h-3 w-3" />
              New Appeal
            </Button>
          </div>
          
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={cn(
                  "flex-shrink-0 h-6 px-2.5 rounded-full text-label-sm transition-all whitespace-nowrap",
                  statusFilter === filter.value 
                    ? "bg-[var(--neutral-900)] text-white" 
                    : "bg-[var(--neutral-50)] text-[var(--neutral-500)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-700)]",
                )}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          {mockAppeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle2 className="mb-3 h-8 w-8 text-[var(--neutral-300)]" />
              <h3 className="text-label-md text-foreground mb-1">No Active Appeals</h3>
              <p className="text-caption text-[var(--neutral-500)] text-center">There are no pending appeals for this patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockAppeals.map((appeal) => (
                <div key={appeal.id} className="p-3 rounded-lg border border-border bg-[var(--neutral-50)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {appeal.status === "Approved" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                        ) : appeal.status === "Pending Review" ? (
                          <Clock className="h-3.5 w-3.5 text-[var(--warning)]" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-[var(--destructive)]" />
                        )}
                        <h4 className="text-label-sm font-semibold text-foreground">{appeal.caseNumber}</h4>
                        <Badge
                          variant={
                            appeal.status === "Approved"
                              ? "success"
                              : appeal.status === "Pending Review"
                                ? "warning"
                                : "secondary"
                          }
                          className="text-ds-badge h-4 px-1.5"
                        >
                          {appeal.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-2">
                          <span className="text-caption text-[var(--neutral-500)] w-16">Submitted</span>
                          <span className="text-caption text-[var(--neutral-700)]">{appeal.submittedDate}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-caption text-[var(--neutral-500)] w-16">Reason</span>
                          <span className="text-caption text-[var(--neutral-700)]">{appeal.reason}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-caption text-[var(--neutral-500)] w-16">Next Step</span>
                          <span className="text-caption text-[var(--neutral-700)]">{appeal.nextStep}</span>
                        </div>
                        {appeal.dueDate !== "-" && (
                          <div className="flex gap-2">
                            <span className="text-caption text-[var(--neutral-500)] w-16">Due Date</span>
                            <span className="text-caption text-[var(--warning)] font-medium">{appeal.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {appeal.status === "Pending Review" && (
                      <Button variant="ghost" size="sm" className="text-caption h-6 px-2 text-[var(--neutral-500)] hover:text-[var(--neutral-800)]">
                        Update
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
