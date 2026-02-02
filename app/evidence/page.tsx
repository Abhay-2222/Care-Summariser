"use client"

import React from "react"

import { useState, useCallback } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  FileText,
  ImageIcon,
  Activity,
  Upload,
  Filter,
  MoreVertical,
  Eye,
  Download,
  Link,
  Star,
  StarOff,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Brain,
  Sparkles,
  FileImage,
  FileVideo,
  FilePlus,
  X,
  ChevronRight,
  Copy,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Document types with icons
const documentTypes = {
  progress_note: { icon: FileText, label: "Progress Note", color: "text-blue-600 bg-blue-100" },
  lab_result: { icon: Activity, label: "Lab Result", color: "text-emerald-600 bg-emerald-100" },
  imaging: { icon: ImageIcon, label: "Imaging Report", color: "text-purple-600 bg-purple-100" },
  consultation: { icon: FileText, label: "Consultation", color: "text-amber-600 bg-amber-100" },
  procedure: { icon: FileText, label: "Procedure Note", color: "text-red-600 bg-red-100" },
  discharge: { icon: FileText, label: "Discharge Summary", color: "text-slate-600 bg-slate-100" },
  external: { icon: FilePlus, label: "External Record", color: "text-indigo-600 bg-indigo-100" },
}

// Mock evidence documents
const evidenceDocuments = [
  {
    id: "doc-1",
    title: "Progress Note - Cardiology",
    type: "progress_note",
    author: "Dr. Michael Chen",
    date: "Jan 22, 2026",
    time: "10:30 AM",
    department: "Cardiology",
    status: "verified",
    relevanceScore: 95,
    excerpt: "Patient evaluated for chest pain. EKG shows normal sinus rhythm. No acute ST changes. Troponin levels within normal limits. Recommend stress test for further evaluation. Patient showing significant improvement with current medication regimen.",
    tags: ["cardiac", "chest pain", "EKG", "troponin"],
    citedInPA: true,
    starred: true,
  },
  {
    id: "doc-2",
    title: "Chest X-Ray Report",
    type: "imaging",
    author: "Dr. Sarah Williams",
    date: "Jan 21, 2026",
    time: "2:15 PM",
    department: "Radiology",
    status: "verified",
    relevanceScore: 88,
    excerpt: "No acute cardiopulmonary abnormality. Heart size normal. Lungs clear. No pleural effusion or pneumothorax. Mild degenerative changes in thoracic spine.",
    tags: ["chest x-ray", "lungs", "heart"],
    citedInPA: false,
    starred: false,
  },
  {
    id: "doc-3",
    title: "Complete Blood Count",
    type: "lab_result",
    author: "Lab Services",
    date: "Jan 22, 2026",
    time: "6:00 AM",
    department: "Laboratory",
    status: "verified",
    relevanceScore: 72,
    excerpt: "WBC 8.2, RBC 4.5, Hemoglobin 13.8, Hematocrit 41.2, Platelets 245. All values within normal limits.",
    tags: ["CBC", "blood count", "hemoglobin"],
    citedInPA: false,
    starred: false,
  },
  {
    id: "doc-4",
    title: "Pulmonology Consultation",
    type: "consultation",
    author: "Dr. Robert Kim",
    date: "Jan 20, 2026",
    time: "3:45 PM",
    department: "Pulmonology",
    status: "pending_review",
    relevanceScore: 91,
    excerpt: "Patient with history of COPD, now presenting with acute exacerbation. Recommend bronchodilator therapy and short course of steroids. PFTs show moderate obstruction.",
    tags: ["COPD", "pulmonology", "PFT", "bronchodilator"],
    citedInPA: true,
    starred: true,
  },
  {
    id: "doc-5",
    title: "Physical Therapy Evaluation",
    type: "progress_note",
    author: "Jennifer Martinez, PT",
    date: "Jan 19, 2026",
    time: "11:00 AM",
    department: "Physical Therapy",
    status: "verified",
    relevanceScore: 65,
    excerpt: "Initial PT evaluation. Patient demonstrates decreased mobility and balance deficits. FIM score 85/126. Recommend daily PT sessions for strength and gait training.",
    tags: ["PT", "mobility", "FIM score", "rehabilitation"],
    citedInPA: false,
    starred: false,
  },
]

// Upload queue mock
const uploadQueue = [
  { id: "up-1", name: "External_PT_Records.pdf", size: "2.4 MB", progress: 100, status: "complete" },
  { id: "up-2", name: "Previous_Admission_Summary.pdf", size: "1.8 MB", progress: 75, status: "uploading" },
  { id: "up-3", name: "Specialist_Consult_Notes.pdf", size: "856 KB", progress: 0, status: "queued" },
]

export default function EvidencePanelPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set())
  const [previewDoc, setPreviewDoc] = useState<typeof evidenceDocuments[0] | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const filteredDocs = evidenceDocuments.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = selectedType === "all" || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setUploadDialogOpen(true)
  }, [])

  const toggleDocSelection = (docId: string) => {
    const newSelected = new Set(selectedDocs)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedDocs(newSelected)
  }

  const getDocTypeInfo = (type: string) => {
    return documentTypes[type as keyof typeof documentTypes] || documentTypes.progress_note
  }

  return (
    <div 
      className="flex h-screen flex-col bg-slate-50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AppHeader />
      
      {/* Drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 shadow-xl border-2 border-dashed border-blue-400">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900">Drop files to upload</p>
            <p className="text-sm text-slate-500">Supports PDF, images, and document files</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 md:p-6">
          <div className="mx-auto max-w-7xl h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Evidence Management</h1>
                <p className="text-sm text-slate-500">Search, organize, and cite clinical documentation</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload
                </Button>
                {selectedDocs.size > 0 && (
                  <Button size="sm">
                    <Link className="h-4 w-4 mr-1.5" />
                    Cite Selected ({selectedDocs.size})
                  </Button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by keyword, date, or document type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  {Object.entries(documentTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Relevance Notice */}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-start gap-3">
              <Brain className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-purple-900">AI-Powered Relevance Scoring</p>
                <p className="text-xs text-purple-700">Documents are automatically scored for relevance to the current PA case. Higher scores indicate stronger supporting evidence.</p>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
              {/* Document List */}
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{filteredDocs.length} Documents</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
                        {evidenceDocuments.filter(d => d.citedInPA).length} Cited
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        <Star className="h-3 w-3 mr-1 text-amber-500" />
                        {evidenceDocuments.filter(d => d.starred).length} Starred
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[350px] lg:h-full">
                    <div className="p-4 space-y-2">
                      {filteredDocs.map((doc) => {
                        const typeInfo = getDocTypeInfo(doc.type)
                        const IconComponent = typeInfo.icon
                        return (
                          <div
                            key={doc.id}
                            className={cn(
                              "p-3 rounded-lg border transition-all cursor-pointer",
                              previewDoc?.id === doc.id
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedDocs.has(doc.id)}
                                onCheckedChange={() => toggleDocSelection(doc.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className={cn("p-2 rounded-lg", typeInfo.color)}>
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-sm text-slate-900 flex items-center gap-2">
                                      {doc.title}
                                      {doc.starred && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                                      {doc.citedInPA && (
                                        <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                          Cited
                                        </Badge>
                                      )}
                                    </p>
                                    <p className="text-xs text-slate-500">{doc.author} | {doc.date}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-[10px]",
                                        doc.relevanceScore >= 90 && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                        doc.relevanceScore >= 70 && doc.relevanceScore < 90 && "bg-blue-50 text-blue-700 border-blue-200",
                                        doc.relevanceScore < 70 && "bg-slate-50 text-slate-600 border-slate-200"
                                      )}
                                    >
                                      {doc.relevanceScore}% relevant
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreVertical className="h-3.5 w-3.5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="h-4 w-4 mr-2" />
                                          View Full Document
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Link className="h-4 w-4 mr-2" />
                                          Cite in PA
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Copy className="h-4 w-4 mr-2" />
                                          Copy Excerpt
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          {doc.starred ? (
                                            <>
                                              <StarOff className="h-4 w-4 mr-2" />
                                              Remove Star
                                            </>
                                          ) : (
                                            <>
                                              <Star className="h-4 w-4 mr-2" />
                                              Add Star
                                            </>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                          <Download className="h-4 w-4 mr-2" />
                                          Download
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{doc.excerpt}</p>
                                <div className="flex items-center gap-1 mt-2 flex-wrap">
                                  {doc.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[9px] bg-slate-50">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {doc.tags.length > 3 && (
                                    <span className="text-[9px] text-slate-400">+{doc.tags.length - 3} more</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Preview Panel */}
              <Card className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Document Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  {previewDoc ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn("text-xs", getDocTypeInfo(previewDoc.type).color)}>
                          {getDocTypeInfo(previewDoc.type).label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px]",
                            previewDoc.status === "verified" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            previewDoc.status === "pending_review" && "bg-amber-50 text-amber-700 border-amber-200"
                          )}
                        >
                          {previewDoc.status === "verified" ? "Verified" : "Pending Review"}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-slate-900">{previewDoc.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{previewDoc.author}</p>
                        <p className="text-xs text-slate-400">{previewDoc.date} at {previewDoc.time}</p>
                      </div>

                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                          <span className="text-xs font-medium text-purple-900">AI Relevance Score</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={previewDoc.relevanceScore} className="h-2 flex-1" />
                          <span className="text-sm font-semibold text-purple-700">{previewDoc.relevanceScore}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-700 mb-2">Document Content</p>
                        <div className="p-3 bg-slate-50 rounded-lg border text-xs text-slate-700 leading-relaxed">
                          {previewDoc.excerpt}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-700 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-1">
                          {previewDoc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              <Tag className="h-2.5 w-2.5 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <Button className="w-full" size="sm">
                          <Link className="h-4 w-4 mr-2" />
                          Cite in PA Letter
                        </Button>
                        <Button variant="outline" className="w-full bg-transparent" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Document
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-slate-400">
                      <div>
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Select a document to preview</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Add external records, consultation notes, or other supporting documentation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX, JPG, PNG up to 25MB</p>
            </div>

            {/* Upload Queue */}
            {uploadQueue.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-700 mb-2">Upload Queue</p>
                <div className="space-y-2">
                  {uploadQueue.map((file) => (
                    <div key={file.id} className="p-2 bg-slate-50 rounded-lg border flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {file.status === "uploading" ? (
                            <>
                              <Progress value={file.progress} className="h-1 flex-1" />
                              <span className="text-[10px] text-slate-500">{file.progress}%</span>
                            </>
                          ) : file.status === "complete" ? (
                            <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Uploaded
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Queued
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">{file.size}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Type Selection */}
            <div>
              <label className="text-xs font-medium text-slate-700">Document Type</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select document type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Patient Selection */}
            <div>
              <label className="text-xs font-medium text-slate-700">Link to Patient</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah Johnson (MRN-892451)</SelectItem>
                  <SelectItem value="james">James Wilson (MRN-445821)</SelectItem>
                  <SelectItem value="maria">Maria Garcia (MRN-331298)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
