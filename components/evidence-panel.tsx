"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/app-context"
import { Search, FileText, Calendar, User } from "lucide-react"

const mockDocuments = [
  {
    id: "1",
    type: "Progress Note",
    date: "Jan 7, 2026 08:00",
    author: "Dr. Sarah Mitchell",
    excerpt: "Patient continues to improve. Diuresis ongoing with good response...",
    relevance: 95,
  },
  {
    id: "2",
    type: "Lab Results",
    date: "Jan 7, 2026 06:30",
    author: "Lab System",
    excerpt: "BNP: 840 (decreased from 1240), Creatinine: 1.2, Potassium: 4.1...",
    relevance: 92,
  },
  {
    id: "3",
    type: "Imaging Report",
    date: "Jan 6, 2026 15:20",
    author: "Dr. James Chen, Radiology",
    excerpt: "Chest X-ray shows interval improvement in pulmonary edema...",
    relevance: 88,
  },
  {
    id: "4",
    type: "Consult Note",
    date: "Jan 6, 2026 10:00",
    author: "Dr. Maria Rodriguez, Cardiology",
    excerpt: "Acute decompensated heart failure likely secondary to medication non-compliance...",
    relevance: 90,
  },
  {
    id: "5",
    type: "Admission Note",
    date: "Jan 5, 2026 14:30",
    author: "Dr. Robert Kim",
    excerpt: "67yo F presenting with acute SOB and chest pain. History of CHF, last admission 3 months ago...",
    relevance: 85,
  },
]

export function EvidencePanel() {
  const { selectedPatient } = useApp()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  if (!selectedPatient) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No patient selected</p>
      </div>
    )
  }

  const filteredDocs = mockDocuments.filter(
    (doc) =>
      searchQuery === "" ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg border border-slate-100">
        {/* Header - minimal */}
        <div className="px-4 py-3 border-b border-slate-50">
          <p className="text-[11px] text-slate-400 mb-2">Evidence Search</p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full h-7 pl-7 pr-3 rounded-md text-xs bg-slate-50 border-0 text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Documents list */}
        <div className="divide-y divide-slate-100">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-3 cursor-pointer transition-colors hover:bg-slate-50"
              onClick={() => setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <h4 className="text-[12px] font-medium text-slate-700">{doc.type}</h4>
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                      {doc.relevance}%
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex gap-3 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {doc.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-2.5 w-2.5" />
                      {doc.author}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">{doc.excerpt}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-slate-400 hover:text-slate-600">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
