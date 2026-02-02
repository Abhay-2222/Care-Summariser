"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="bg-white rounded-lg border border-slate-100">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] text-slate-400">Appeals Management</p>
            <Button size="sm" className="gap-1.5 text-[11px] h-7">
              <FileText className="h-3 w-3" />
              New Appeal
            </Button>
          </div>
          
          {/* Status filters */}
          <div className="flex flex-wrap gap-1.5">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                className={cn(
                  "h-6 px-2 rounded text-[11px] transition-all",
                  statusFilter === filter.value 
                    ? "bg-slate-700 text-white font-medium" 
                    : "text-slate-400 hover:text-slate-500 hover:bg-slate-50",
                )}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {mockAppeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <CheckCircle2 className="mb-3 h-8 w-8 text-slate-300" />
              <h3 className="text-[13px] font-medium text-slate-700 mb-1">No Active Appeals</h3>
              <p className="text-[11px] text-slate-400 text-center">There are no pending appeals for this patient</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mockAppeals.map((appeal) => (
                <div key={appeal.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {appeal.status === "Approved" ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : appeal.status === "Pending Review" ? (
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <h4 className="text-[12px] font-medium text-slate-700">{appeal.caseNumber}</h4>
                        <Badge
                          variant={
                            appeal.status === "Approved"
                              ? "success"
                              : appeal.status === "Pending Review"
                                ? "warning"
                                : "secondary"
                          }
                          className="text-[9px] h-4 px-1.5"
                        >
                          {appeal.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-[11px]">
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-16">Submitted</span>
                          <span className="text-slate-600">{appeal.submittedDate}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-16">Reason</span>
                          <span className="text-slate-600">{appeal.reason}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-16">Next Step</span>
                          <span className="text-slate-600">{appeal.nextStep}</span>
                        </div>
                        {appeal.dueDate !== "-" && (
                          <div className="flex gap-2">
                            <span className="text-slate-400 w-16">Due Date</span>
                            <span className="text-amber-600 font-medium">{appeal.dueDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {appeal.status === "Pending Review" && (
                      <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-slate-400 hover:text-slate-600">
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
