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
import { useRouter } from "next/navigation"
import { statusConfig, urgencyConfig } from "@/lib/workflow-utils"
import type { CaseStatus } from "@/lib/types"
import { typography } from "@/lib/design-system"
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

const statusOptions: { label: string; value: CaseStatus | "ALL"; color: string }[] = [
  { label: "All", value: "ALL", color: "bg-slate-100 text-slate-600" },
  { label: "New", value: "new", color: "bg-blue-100 text-blue-700" },
  { label: "In Progress", value: "in_progress", color: "bg-amber-100 text-amber-700" },
  { label: "Needs MD", value: "needs_physician", color: "bg-amber-100 text-amber-700" },
  { label: "Ready", value: "ready", color: "bg-emerald-100 text-emerald-700" },
  { label: "Submitted", value: "submitted", color: "bg-sky-100 text-sky-700" },
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
    claimCase,
    patientListOpen,
    setPatientListOpen,
  } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const isMobile = useIsMobile()
  
  // Use context state for mobile sheet
  const mobileOpen = patientListOpen
  const setMobileOpen = setPatientListOpen
  const router = useRouter()

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesUrgency = selectedFilter === "ALL" || patient.urgency === selectedFilter
      const matchesStatus = statusFilter === "ALL" || patient.workflow.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesUrgency && matchesStatus && matchesSearch
    })
  }, [patients, selectedFilter, statusFilter, searchQuery])

  // Sort by urgency priority and then by status
  const sortedPatients = useMemo(() => {
    const urgencyPriority = { STAT: 0, URGENT: 1, ROUTINE: 2 }
    const statusPriority = { new: 0, needs_physician: 1, in_progress: 2, ready: 3, submitted: 4, approved: 5, denied: 6, appealing: 7 }
    
    return [...filteredPatients].sort((a, b) => {
      // First by urgency
      const urgencyDiff = urgencyPriority[a.urgency] - urgencyPriority[b.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      // Then by status
      return statusPriority[a.workflow.status] - statusPriority[b.workflow.status]
    })
  }, [filteredPatients])

  const statusCounts = useMemo(() => ({
    ALL: patients.length,
    new: patients.filter(p => p.workflow.status === "new").length,
    in_progress: patients.filter(p => p.workflow.status === "in_progress").length,
    needs_physician: patients.filter(p => p.workflow.status === "needs_physician").length,
    ready: patients.filter(p => p.workflow.status === "ready").length,
    submitted: patients.filter(p => p.workflow.status === "submitted").length,
  }), [patients])

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
      
      if ((e.key === "j" || e.key === "k") && sortedPatients.length > 0) {
        const currentIndex = sortedPatients.findIndex(p => p.id === selectedPatientId)
        let newIndex = e.key === "j" ? currentIndex + 1 : currentIndex - 1
        newIndex = Math.max(0, Math.min(sortedPatients.length - 1, newIndex))
        const newPatient = sortedPatients[newIndex]
        if (newPatient) {
          setSelectedPatientId(newPatient.id)
          router.push(`/patient/${newPatient.id}`)
        }
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sortedPatients, selectedPatientId, setSelectedPatientId, router])

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
        <div className="px-3 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-slate-800">Patient Queue</h2>
            <p className="text-[10px] text-slate-500">{sortedPatients.length} patients</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      )}
      
      {/* Header - Optimized minimal design */}
      <div className="px-3 py-2.5 border-b border-slate-100">
        {/* Search + Filters in one row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
            <input
              id="patient-search"
              type="text"
              placeholder="Search..."
              className="w-full h-8 pl-8 pr-8 rounded-lg text-[12px] bg-slate-50 border border-slate-100 text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
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
                className="h-8 px-2.5 text-[11px] gap-1.5 bg-white border-slate-200"
              >
                <Filter className="h-3 w-3 text-slate-400" />
                {statusFilter === "ALL" ? "All" : statusOptions.find(s => s.value === statusFilter)?.label}
                <ChevronDown className="h-3 w-3 text-slate-400" />
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
                      "flex items-center justify-between text-[11px] cursor-pointer",
                      isActive && "bg-slate-100"
                    )}
                  >
                    <span>{status.label}</span>
                    <span className="text-slate-400 tabular-nums">{count}</span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Urgency quick filters - compact icons only */}
        <div className="flex items-center gap-0.5 mt-2">
          {urgencyOptions.map((filter) => {
            const isActive = selectedFilter === filter.value
            const count = urgencyCounts[filter.value as keyof typeof urgencyCounts]
            const Icon = filter.icon
            
            return (
              <button
                key={filter.value}
                type="button"
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all",
                  isActive 
                    ? "bg-slate-800 text-white font-medium" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
                )}
                onClick={() => setSelectedFilter(filter.value)}
              >
                <Icon className={cn(
                  "h-3 w-3",
                  !isActive && filter.value === "STAT" && "text-red-400",
                  !isActive && filter.value === "URGENT" && "text-amber-400",
                )} />
                {filter.value !== "ALL" && <span className="tabular-nums">{count}</span>}
                {filter.value === "ALL" && <span>All</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {sortedPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Search className="h-5 w-5 mb-2" />
            <span className="text-[11px]">No patients found</span>
          </div>
        ) : (
          <div className="py-1">
            {sortedPatients.map((patient) => {
              const isSelected = selectedPatientId === patient.id
              const workflow = patient.workflow
              const statusInfo = statusConfig[workflow.status]
              const isNew = workflow.status === "new"
              const canClaim = isNew && currentRole === "case_manager"

              return (
                <div
                  key={patient.id}
                  className={cn(
                    "relative px-2 py-2 transition-colors cursor-pointer group",
                    isSelected
                      ? "bg-blue-50 border-l-2 border-l-blue-500"
                      : "hover:bg-slate-50 border-l-2 border-l-transparent",
                  )}
                  onClick={() => {
                    setSelectedPatientId(patient.id)
                    router.push(`/patient/${patient.id}`)
                  }}
                >
                  <div className="flex items-start gap-2">
                    {/* Bulk selection checkbox or Urgency dot */}
                    {bulkMode ? (
                      <button
                        className="mt-1 flex-shrink-0"
                        onClick={(e) => togglePatientSelection(patient.id, e)}
                      >
                        {selectedIds.has(patient.id) ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300 hover:text-slate-400" />
                        )}
                      </button>
                    ) : (
                      <div className={cn(
                        "mt-1.5 h-2 w-2 rounded-full flex-shrink-0",
                        patient.urgency === "STAT" ? "bg-red-500" :
                        patient.urgency === "URGENT" ? "bg-amber-500" : "bg-slate-300"
                      )} />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* Name row */}
                      <div className="flex items-center justify-between gap-1">
                        <span className={cn(
                          "text-[12px] font-medium truncate",
                          isSelected ? "text-blue-700" : "text-slate-800"
                        )}>
                          {patient.name}
                        </span>
                        {/* Status badge - consistent styling everywhere */}
                        <span className={cn(
                          "flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded",
                          statusInfo.badgeClass
                        )}>
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500">{patient.mrn}</span>
                        <span className="text-[10px] text-slate-300">|</span>
                        <span className="text-[10px] text-slate-500">{patient.age}yo {patient.gender}</span>
                        <span className="text-[10px] text-slate-300">|</span>
                        <span className="text-[10px] text-slate-400 truncate">{patient.insurance}</span>
                      </div>
                      
                      {/* Progress & Assignment */}
                      <div className="flex items-center gap-2 mt-1.5">
                        {/* Progress bar */}
                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all",
                              workflow.progressPercent >= 80 ? "bg-emerald-500" :
                              workflow.progressPercent >= 50 ? "bg-amber-500" : "bg-slate-300"
                            )}
                            style={{ width: `${workflow.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 tabular-nums w-7">{workflow.progressPercent}%</span>
                      </div>

                      {/* Assignment info or Claim action */}
                      <div className="flex items-center justify-between mt-1.5">
                        {workflow.assignment ? (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400">
                            <User className="h-2.5 w-2.5" />
                            <span className="truncate max-w-[100px]">{workflow.assignment.assignedTo}</span>
                          </div>
                        ) : canClaim ? (
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="flex items-center gap-1 text-[9px] text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                  onClick={(e) => handleClaimCase(patient.id, e)}
                                >
                                  <span className="h-4 w-4 rounded bg-blue-100 flex items-center justify-center">
                                    <ArrowRight className="h-2.5 w-2.5" />
                                  </span>
                                  Start Review
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-[9px]">
                                Claim this case and begin UR review
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-[9px] text-slate-300 italic">Awaiting assignment</span>
                        )}
                        
                        {/* Risk indicator */}
                        {patient.careLens?.denialRisk === "High" && (
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-500 border border-red-200">
                            High Risk
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {bulkMode && selectedIds.size > 0 && (
        <div className="px-3 py-2 border-t border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-blue-700">
                {selectedIds.size} selected
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                onClick={selectAllVisible}
              >
                Select all
              </Button>
            </div>
            <div className="flex items-center gap-1">
              {canBulkClaim && (
                <Button
                  size="sm"
                  className="h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700"
                  onClick={handleBulkClaim}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Claim ({selectedPatients.filter(p => p.workflow.status === "new").length})
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[10px] text-slate-500"
                onClick={clearSelection}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - minimal, only shows filtered count when different */}
      <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          {sortedPatients.length !== patients.length ? (
            <span className="tabular-nums">{sortedPatients.length} shown</span>
          ) : (
            <span className="tabular-nums">{patients.length} cases</span>
          )}
          {currentRole === "case_manager" && !bulkMode && (
            <button
              type="button"
              className="text-slate-500 hover:text-slate-700"
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
              className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 md:hidden"
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
    <aside className="hidden md:flex w-72 border-r border-slate-200 bg-white flex-col">
      {panelContent(false)}
    </aside>
  )
}
