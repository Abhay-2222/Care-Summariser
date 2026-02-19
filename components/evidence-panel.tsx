"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/app-context"
import { Search, FileText, Calendar, User, CheckCircle2, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { typography } from "@/lib/design-system"

const docTypeFilters = [
  { value: "all", label: "All" },
  { value: "progress", label: "Progress Notes" },
  { value: "lab", label: "Labs" },
  { value: "imaging", label: "Imaging" },
  { value: "consult", label: "Consults" },
  { value: "needed", label: "Needed for Auth" }, // New filter for docs needed for authorization
]

// Mock documents with requirements they satisfy
const mockDocuments = [
  {
    id: "1",
    type: "Progress Note",
    date: "Jan 7, 2026 08:00",
    author: "Dr. Sarah Mitchell",
    excerpt: "Patient continues to improve. Diuresis ongoing with good response...",
    relevance: 95,
    satisfiesRequirements: ["Medical Necessity", "Clinical Documentation"],
    isNeededForAuth: true,
  },
  {
    id: "2",
    type: "Lab Results",
    date: "Jan 7, 2026 06:30",
    author: "Lab System",
    excerpt: "BNP: 840 (decreased from 1240), Creatinine: 1.2, Potassium: 4.1...",
    relevance: 92,
    satisfiesRequirements: ["Lab Documentation"],
    isNeededForAuth: true,
  },
  {
    id: "3",
    type: "Imaging Report",
    date: "Jan 6, 2026 15:20",
    author: "Dr. James Chen, Radiology",
    excerpt: "Chest X-ray shows interval improvement in pulmonary edema...",
    relevance: 88,
    satisfiesRequirements: ["Diagnostic Imaging"],
    isNeededForAuth: true,
  },
  {
    id: "4",
    type: "Consult Note",
    date: "Jan 6, 2026 10:00",
    author: "Dr. Maria Rodriguez, Cardiology",
    excerpt: "Acute decompensated heart failure likely secondary to medication non-compliance...",
    relevance: 90,
    satisfiesRequirements: ["Specialist Consultation", "Medical Necessity"],
    isNeededForAuth: true,
  },
  {
    id: "5",
    type: "Admission Note",
    date: "Jan 5, 2026 14:30",
    author: "Dr. Robert Kim",
    excerpt: "67yo F presenting with acute SOB and chest pain. History of CHF, last admission 3 months ago...",
    relevance: 85,
    satisfiesRequirements: ["Initial Assessment"],
    isNeededForAuth: false,
  },
]

export function EvidencePanel() {
  const { selectedPatient } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docTypeFilter, setDocTypeFilter] = useState("all")

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    )
  }

  const filteredDocs = mockDocuments.filter((doc) => {
    const matchesSearch =
      searchQuery === "" ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = 
      docTypeFilter === "all" || 
      (docTypeFilter === "needed" && doc.isNeededForAuth) ||
      doc.type.toLowerCase().includes(docTypeFilter.toLowerCase())
    
    return matchesSearch && matchesFilter
  })

  // Count docs needed for auth
  const neededForAuthCount = mockDocuments.filter(d => d.isNeededForAuth).length

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg border border-slate-100">
        {/* Header - minimal with design system typography */}
        <div className="px-4 py-3 border-b border-slate-100">
          <p className={cn(typography.sectionHeader, "mb-2")}>EVIDENCE SEARCH</p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full h-7 pl-7 pr-3 rounded-md text-[11px] bg-[var(--neutral-50)] border-0 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Type filters with consistent badge styling */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {docTypeFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={cn(
                  "h-6 px-2 rounded text-[11px] transition-all",
                  docTypeFilter === filter.value 
                    ? "bg-slate-700 text-white font-medium" 
                    : "text-[var(--neutral-400)] hover:text-[var(--neutral-500)] hover:bg-[var(--neutral-50)]",
                  filter.value === "needed" && "border border-blue-200"
                )}
                onClick={() => setDocTypeFilter(filter.value)}
              >
                {filter.label}
                {filter.value === "needed" && (
                  <span className="ml-1 text-[9px]">({neededForAuthCount})</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Documents list with Satisfies badges */}
        <div className="divide-y divide-slate-100">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "p-3 cursor-pointer transition-colors hover:bg-[var(--neutral-50)]",
                selectedDoc === doc.id && "bg-[var(--status-info-bg)] border-l-2 border-l-blue-500"
              )}
              onClick={() => setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-[var(--neutral-400)] flex-shrink-0" />
                    <h4 className={cn(typography.title)}>{doc.type}</h4>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-border">
                      {doc.relevance}% match
                    </span>
                    {doc.isNeededForAuth && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--status-info-bg)] text-[var(--brand-500)] border border-blue-200">
                        Auth Doc
                      </span>
                    )}
                  </div>
                  
                  {/* Metadata row */}
                  <div className="mt-1.5 flex gap-3">
                    <div className={cn(typography.label, "flex items-center gap-1")}>
                      <Calendar className="h-2.5 w-2.5" />
                      {doc.date}
                    </div>
                    <div className={cn(typography.label, "flex items-center gap-1")}>
                      <User className="h-2.5 w-2.5" />
                      {doc.author}
                    </div>
                  </div>
                  
                  {/* Excerpt */}
                  <p className={cn(typography.body, "mt-1.5 line-clamp-2")}>{doc.excerpt}</p>
                  
                  {/* Satisfies Requirements - clickable links back to Summary */}
                  {doc.satisfiesRequirements && doc.satisfiesRequirements.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      <Link2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                      <span className={cn(typography.label, "text-[var(--success)]")}>Satisfies:</span>
                      <div className="flex flex-wrap gap-1">
                        {doc.satisfiesRequirements.map((req) => (
                          <span 
                            key={req}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-[var(--success)] border border-emerald-200 cursor-pointer hover:bg-emerald-100"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] h-6 px-2 text-[var(--neutral-400)] hover:text-slate-600 bg-transparent"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer stats */}
        <div className="px-4 py-2 border-t border-slate-100 bg-[var(--neutral-50)]">
          <div className="flex items-center justify-between">
            <span className={typography.label}>
              {filteredDocs.length} documents · {neededForAuthCount} needed for authorization
            </span>
            <div className="flex items-center gap-1 text-[var(--success)]">
              <CheckCircle2 className="h-3 w-3" />
              <span className={cn(typography.label, "text-[var(--success)]")}>
                {mockDocuments.filter(d => d.satisfiesRequirements && d.satisfiesRequirements.length > 0).length} linked to requirements
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
