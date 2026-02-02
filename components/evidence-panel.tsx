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
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Evidence Search</CardTitle>
          <div className="relative pt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => setSelectedDoc(doc.id === selectedDoc ? null : doc.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">{doc.type}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {doc.relevance}% relevant
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.author}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{doc.excerpt}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Full
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
