"use client"

import React from "react"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  AlertTriangle,
  Clock,
  Zap,
  X,
  Circle,
  FileText,
  User,
  CheckCircle,
  Send,
  Play,
  ArrowRight,
  CheckSquare,
  Square,
  MoreHorizontal,
  Sparkles,
  ClipboardList,
  ChevronDown,
  Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/app-context"
import { usePathname, useRouter } from "next/navigation"
import { compareByDeadline, formatDeadline, isDueToday, rulesMet, statusConfig, urgencyConfig } from "@/lib/workflow-utils"
import type { CaseStatus } from "@/lib/types"
import { statusLabels, typography } from "@/lib/design-system"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

const urgencyOptions = [
  { label: "All", value: "ALL", icon: Circle },
  { label: "STAT", value: "STAT", icon: Zap },
  { label: "Urgent", value: "URGENT", icon: AlertTriangle },
  { label: "Routine", value: "ROUTINE", icon: Clock },
]

const queueStatuses = ["new", "in_progress", "needs_physician", "escalated", "ready", "submitted"] as const

const statusOptions: { label: string; value: CaseStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  ...queueStatuses.map((value) => ({ label: statusLabels[value], value })),
]

export function PatientListPanel() {
  const { 
    patients, 
    selectedPatientId, 
    setSelectedPatientId, 
    selectedFilter, 
    setSelectedFilter, 
    statusFilter,
    setStatusFilter,
  currentRole,
  currentUser,
  hasPermission,
  claimCase,
  patientListOpen,
  setPatientListOpen,
} = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkMode, setBulkMode] = useState(false)
  const [queueSlice, setQueueSlice] = useState<"all" | "due" | "yours" | "waiting">("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const isMobile = useIsMobile()
  
  // Use context state for mobile sheet
  const mobileOpen = patientListOpen
  const setMobileOpen = setPatientListOpen
  const router = useRouter()
  const pathname = usePathname()

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesUrgency = selectedFilter === "ALL" || patient.urgency === selectedFilter
      const matchesStatus = statusFilter === "ALL" || patient.workflow.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())
      const dueToday = isDueToday(patient)
      const yours = patient.workflow.assignment?.assignedTo === currentUser.name
      const waiting = patient.workflow.status === "needs_physician" || patient.workflow.status === "escalated" || patient.workflow.status === "submitted"
      const matchesSlice =
        queueSlice === "all" ||
        (queueSlice === "due" && dueToday) ||
        (queueSlice === "yours" && yours) ||
        (queueSlice === "waiting" && waiting)
      return matchesUrgency && matchesStatus && matchesSearch && matchesSlice
    })
  }, [patients, selectedFilter, statusFilter, searchQuery, queueSlice, currentUser.name])

  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort(compareByDeadline)
  }, [filteredPatients])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: patients.length }
    for (const patient of patients) {
      counts[patient.workflow.status] = (counts[patient.workflow.status] ?? 0) + 1
    }
    return counts
  }, [patients])

  const urgencyCounts = useMemo(() => ({
    ALL: patients.length,
    STAT: patients.filter(p => p.urgency === "STAT").length,
    URGENT: patients.filter(p => p.urgency === "URGENT").length,
    ROUTINE: patients.filter(p => p.urgency === "ROUTINE").length,
  }), [patients])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        document.getElementById("patient-search")?.focus()
      }
      
      if ((e.key === "j" || e.key === "k" || e.key === "ArrowDown" || e.key === "ArrowUp") && sortedPatients.length > 0) {
        e.preventDefault()
        const currentIndex = sortedPatients.findIndex(p => p.id === selectedPatientId)
        const moveNext = e.key === "j" || e.key === "ArrowDown"
        let newIndex = moveNext ? currentIndex + 1 : currentIndex - 1
        newIndex = Math.max(0, Math.min(sortedPatients.length - 1, newIndex))
        const newPatient = sortedPatients[newIndex]
        if (newPatient) {
          setSelectedPatientId(newPatient.id)
          if (pathname.startsWith("/patient")) router.push(`/patient/${newPatient.id}`)
        }
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sortedPatients, selectedPatientId, setSelectedPatientId, router, pathname])

  const handleClaimCase = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    claimCase(patientId)
  }

  // Bulk selection handlers
  const togglePatientSelection = (patientId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(patientId)) {
        next.delete(patientId)
      } else {
        next.add(patientId)
      }
      return next
    })
  }

  const selectAllVisible = () => {
    setSelectedIds(new Set(sortedPatients.map(p => p.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setBulkMode(false)
  }

  const handleBulkClaim = () => {
    selectedIds.forEach(id => {
      const patient = patients.find(p => p.id === id)
      if (patient?.workflow.status === "new") {
        claimCase(id)
      }
    })
    clearSelection()
  }

  const selectedPatients = useMemo(() => 
    patients.filter(p => selectedIds.has(p.id)), 
    [patients, selectedIds]
  )

  const canBulkClaim = selectedPatients.some(p => p.workflow.status === "new")

  // Patient list content (shared between mobile and desktop)
  const panelContent = (showClose?: boolean) => (
    <div className="flex flex-col h-full">
      {/* Mobile header with close */}
      {showClose && (
        <div className="px-3 py-2.5 border-b border-border bg-card flex items-center justify-between">
          <div>
            <h2 className={typography.title}>Queue</h2>
            <p className="text-caption text-[var(--neutral-500)]">{sortedPatients.length} patients</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4 text-[var(--neutral-500)]" />
          </Button>
        </div>
      )}
      
      {/* Header - Optimized minimal design */}
      <div className="px-3 py-2.5 border-b border-border">
        <div className="flex gap-1 mb-2">
          {([
            ["due", "Due today", patients.filter((patient) => isDueToday(patient)).length],
            ["yours", "Yours", patients.filter((patient) => patient.workflow.assignment?.assignedTo === currentUser.name).length],
            ["waiting", "Waiting", patients.filter((patient) => patient.workflow.status === "needs_physician" || patient.workflow.status === "escalated" || patient.workflow.status === "submitted").length],
          ] as const).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setQueueSlice(queueSlice === id ? "all" : id)}
              className={cn(
                "focus-ring flex-1 rounded-lg border px-2 py-1 text-left",
                queueSlice === id ? "border-[var(--brand-500)] bg-[var(--brand-50)]" : "border-border bg-card"
              )}
            >
              <span className="block text-caption text-[var(--neutral-500)]">{label}</span>
              <span className="block text-label-md text-foreground tabular-nums">{count}</span>
            </button>
          ))}
        </div>
        {/* Search + Filters in one row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--neutral-500)]" />
            <input
              id="patient-search"
              type="text"
              placeholder="Name or MRN"
              className="w-full h-8 pl-8 pr-8 rounded-lg text-body-sm bg-[var(--neutral-50)] border border-border text-foreground placeholder:text-[var(--neutral-500)] focus-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--neutral-500)] hover:text-[var(--neutral-700)] focus-ring"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          {/* Status dropdown - replaces pills */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2.5 text-label-sm gap-1.5 bg-card border-border"
              >
                <Filter className="h-3 w-3 text-[var(--neutral-400)]" />
                {statusFilter === "ALL" ? "All" : statusOptions.find(s => s.value === statusFilter)?.label}
                <ChevronDown className="h-3 w-3 text-[var(--neutral-400)]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {statusOptions.map((status) => {
                const count = statusCounts[status.value as keyof typeof statusCounts] || 0
                const isActive = statusFilter === status.value
                return (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={cn(
                      "flex items-center justify-between text-body-sm cursor-pointer",
                      isActive && "bg-[var(--neutral-100)]"
                    )}
                  >
                    <span>{status.label}</span>
                    <span className="text-body-sm text-[var(--neutral-500)] tabular-nums">{count}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {(queueSlice !== "all" || statusFilter !== "ALL" || searchQuery !== "" || selectedFilter !== "ALL") && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className={typography.meta}>
              {sortedPatients.length} of {patients.length}
              {queueSlice !== "all" ? ` · ${queueSlice === "due" ? "Due today" : queueSlice === "yours" ? "Yours" : "Waiting"}` : ""}
              {statusFilter !== "ALL" ? ` · ${statusOptions.find((status) => status.value === statusFilter)?.label}` : ""}
              {searchQuery ? ` · “${searchQuery}”` : ""}
            </p>
            <button
              type="button"
              className={cn(typography.meta, "text-[var(--brand-600)] focus-ring")}
              onClick={() => {
                setQueueSlice("all")
                setStatusFilter("ALL")
                setSelectedFilter("ALL")
                setSearchQuery("")
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {sortedPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--neutral-500)]">
            <Search className="h-5 w-5 mb-2" />
            <span className="text-caption">
              {searchQuery ? `No match for "${searchQuery}"` : "Nothing in the queue."}
            </span>
          </div>
        ) : (
          <div className="py-1">
            {sortedPatients.map((patient) => {
              const isSelected = selectedPatientId === patient.id
              const workflow = patient.workflow
              const statusInfo = statusConfig[workflow.status]

              return (
                <div key={patient.id} className="flex items-start">
                    {bulkMode && (
                      <button
                        type="button"
                        aria-label={`Select ${patient.name}`}
                        className="mt-3 ml-2 flex-shrink-0 focus-ring"
                        onClick={(e) => togglePatientSelection(patient.id, e)}
                      >
                        {selectedIds.has(patient.id) ? (
                          <CheckSquare className="h-4 w-4 text-[var(--brand-500)]" />
                        ) : (
                          <Square className="h-4 w-4 text-[var(--neutral-500)]" />
                        )}
                      </button>
                    )}
                  <button
                    type="button"
                    className={cn(
                      "relative flex-1 px-2 py-2 text-left transition-colors cursor-pointer group focus-ring",
                      isSelected
                        ? "bg-[var(--brand-50)] border-l-2 border-l-[var(--brand-500)]"
                        : "hover:bg-[var(--neutral-50)] border-l-2 border-l-transparent",
                    )}
                    onClick={() => {
                      setSelectedPatientId(patient.id)
                      router.push(`/patient/${patient.id}`)
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-body truncate", isSelected ? "text-[var(--brand-700)]" : "text-[var(--neutral-800)]")}>
                          {patient.name}
                        </span>
                        <span className={cn("flex-shrink-0 text-meta", statusInfo.badgeClass)}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                          "text-meta",
                          patient.paDeadline?.status === "overdue" ? "text-[var(--status-error-text)]" : "text-[var(--neutral-500)]"
                        )}>
                          {patient.paDeadline
                            ? formatDeadline(patient.paDeadline.hoursRemaining)
                            : `${rulesMet(patient)} of ${patient.payerRules.length}`}
                        </span>
                        {patient.careLens?.denialRisk === "High" && (
                          <span className="text-meta text-[var(--neutral-800)]">High risk</span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="px-3 py-2 border-t border-[var(--brand-100)] bg-[var(--brand-50)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-label-sm text-[var(--brand-700)]">
                {selectedIds.size} selected
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-caption text-[var(--brand-500)] hover:text-[var(--brand-600)] hover:bg-[var(--brand-100)]"
                onClick={selectAllVisible}
              >
                Select all
              </Button>
            </div>
            <div className="flex items-center gap-1">
              {canBulkClaim && (
                <Button
                  size="sm"
                  className="h-6 px-2 text-caption bg-[var(--brand-500)] hover:bg-[var(--brand-600)]"
                  onClick={handleBulkClaim}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Claim ({selectedPatients.filter(p => p.workflow.status === "new").length})
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-caption text-[var(--neutral-500)]"
                onClick={clearSelection}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - minimal, only shows filtered count when different */}
      <div className="px-3 py-1.5 border-t border-border bg-[var(--neutral-50)]">
        <div className="flex items-center justify-between text-caption text-[var(--neutral-600)]">
          {sortedPatients.length !== patients.length ? (
            <span className="tabular-nums">{sortedPatients.length} shown</span>
          ) : (
            <span className="tabular-nums">{patients.length} cases</span>
          )}
          {hasPermission("claim_case") && !bulkMode && (
            <button
              type="button"
              className="focus-ring text-[var(--neutral-500)] hover:text-foreground"
              onClick={() => setBulkMode(true)}
            >
              Bulk
            </button>
          )}
        </div>
      </div>
    </div>
  )

  // Mobile: Sheet trigger + drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile floating button */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              size="sm"
              className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-ds-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] md:hidden"
            >
              <ClipboardList className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-80 p-0 [&>button]:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Patient Queue</SheetTitle>
            </SheetHeader>
            {panelContent(true)}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop: Fixed sidebar
  return (
    <aside className="hidden md:flex w-72 border-r border-border bg-card flex-col">
      {panelContent(false)}
    </aside>
  )
}
