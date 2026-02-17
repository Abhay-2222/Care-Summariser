"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Phone,
  Calendar,
  AlertTriangle,
  Brain,
  Send,
  Download,
  Copy,
  Sparkles,
  ArrowRight,
  Edit,
  Plus,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock denied cases for appeals
const deniedCases = [
  {
    id: "den-1",
    paNumber: "PA-2026-45678",
    patientName: "John Davis",
    mrn: "MRN-556721",
    diagnosis: "Lumbar Spinal Fusion",
    payer: "Aetna",
    deniedAt: "Jan 18, 2026",
    appealDeadline: "Feb 17, 2026",
    daysRemaining: 25,
    denialReason: "Insufficient documentation of failed conservative treatment. Required: 6+ months of documented physical therapy and pain management.",
    denialCode: "MED-NEC-001",
    status: "pending_appeal",
    aiSuggestedStrategy: "Request PT records from outpatient facility. Patient reported 8 months of PT - records may be in external system.",
    similarCaseSuccessRate: 72,
  },
  {
    id: "den-2",
    paNumber: "PA-2026-45234",
    patientName: "Maria Garcia",
    mrn: "MRN-331298",
    diagnosis: "Bilateral Knee Replacement",
    payer: "UnitedHealth",
    deniedAt: "Jan 15, 2026",
    appealDeadline: "Feb 14, 2026",
    daysRemaining: 22,
    denialReason: "Patient BMI exceeds payer threshold (>40). Bariatric evaluation required before orthopedic procedure approval.",
    denialCode: "CRIT-BMI-002",
    status: "appeal_in_progress",
    aiSuggestedStrategy: "Document medical reasons why bariatric surgery is contraindicated. Cite rheumatology notes on inflammation severity.",
    similarCaseSuccessRate: 58,
  },
  {
    id: "den-3",
    paNumber: "PA-2026-44892",
    patientName: "Robert Martinez",
    mrn: "MRN-889012",
    diagnosis: "Extended SNF Stay",
    payer: "Medicare Advantage",
    deniedAt: "Jan 10, 2026",
    appealDeadline: "Feb 9, 2026",
    daysRemaining: 17,
    denialReason: "Patient meets criteria for discharge to home health. Skilled nursing level of care not justified.",
    denialCode: "LOC-SNF-003",
    status: "p2p_scheduled",
    p2pScheduled: "Jan 25, 2026 at 2:00 PM",
    aiSuggestedStrategy: "Emphasize 24-hour skilled nursing needs: wound care, IV antibiotics, PT/OT intensity. Document why home health cannot meet needs.",
    similarCaseSuccessRate: 81,
  },
]

// Appeal letter templates
const letterTemplates = [
  { id: "medical-necessity", name: "Medical Necessity Appeal", description: "Standard appeal for medical necessity denials" },
  { id: "level-of-care", name: "Level of Care Appeal", description: "Appeal for LOC/setting denials" },
  { id: "experimental", name: "Experimental Treatment Appeal", description: "Appeal for treatments deemed experimental" },
  { id: "prior-auth-retro", name: "Retrospective PA Appeal", description: "Appeal for missed prior authorization" },
]

// Mock literature references
const literatureReferences = [
  {
    id: "lit-1",
    title: "Efficacy of Spinal Fusion in Degenerative Disc Disease",
    journal: "Journal of Spine Surgery",
    year: 2024,
    relevance: "High",
    citation: "Smith et al., J Spine Surg 2024;10(2):145-156",
  },
  {
    id: "lit-2",
    title: "Conservative Treatment Duration Before Surgical Intervention",
    journal: "American Journal of Orthopedics",
    year: 2023,
    relevance: "High",
    citation: "Johnson et al., Am J Orthop 2023;52(4):312-320",
  },
  {
    id: "lit-3",
    title: "Medicare Coverage Guidelines for Spinal Procedures",
    journal: "CMS Policy Manual",
    year: 2025,
    relevance: "Critical",
    citation: "CMS Pub 100-03, Section 150.1",
  },
]

export default function AppealsPage() {
  const [selectedCase, setSelectedCase] = useState<typeof deniedCases[0] | null>(null)
  const [activeTab, setActiveTab] = useState("queue")
  const [letterDialogOpen, setLetterDialogOpen] = useState(false)
  const [p2pDialogOpen, setP2PDialogOpen] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const handleGenerateLetter = async () => {
    if (!selectedCase) return
    setIsGenerating(true)
    
    // Simulate AI letter generation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const letter = `APPEAL LETTER

Date: ${new Date().toLocaleDateString()}
Re: Prior Authorization Appeal - ${selectedCase.paNumber}
Patient: ${selectedCase.patientName} (${selectedCase.mrn})
Diagnosis: ${selectedCase.diagnosis}

Dear Medical Director,

I am writing to formally appeal the denial of prior authorization for ${selectedCase.patientName}'s ${selectedCase.diagnosis} procedure.

DENIAL REASON ADDRESSED:
${selectedCase.denialReason}

CLINICAL JUSTIFICATION:
Based on a comprehensive review of the patient's medical record, we respectfully disagree with this determination for the following reasons:

1. DOCUMENTED CONSERVATIVE TREATMENT FAILURE
   - Patient has undergone extensive conservative management including physical therapy, pain management interventions, and activity modification
   - Treatment duration exceeds payer requirements when external records are included
   - Functional status continues to decline despite optimal conservative care

2. MEDICAL NECESSITY
   - Current symptoms significantly impact activities of daily living
   - Quality of life measures indicate severe impairment
   - Continued conservative management poses risks of further deterioration

3. SUPPORTING LITERATURE
   - Current clinical guidelines support surgical intervention in cases of failed conservative management
   - Peer-reviewed literature demonstrates efficacy of proposed treatment
   - Similar cases show ${selectedCase.similarCaseSuccessRate}% approval rate on appeal

REQUESTED ACTION:
We respectfully request reconsideration of this denial and approval of the requested authorization.

Supporting documentation attached:
- Complete physical therapy records
- Pain management consultation notes
- Functional assessment scores
- Relevant medical literature

Please contact our office to schedule a peer-to-peer review if additional clarification is needed.

Sincerely,
[Attending Physician Name]
[Medical License Number]
[Contact Information]`

    setGeneratedLetter(letter)
    setIsGenerating(false)
  }

  const pendingCount = deniedCases.filter(c => c.status === "pending_appeal").length
  const inProgressCount = deniedCases.filter(c => c.status === "appeal_in_progress" || c.status === "p2p_scheduled").length

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <AppHeader />
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 md:p-6">
          <div className="mx-auto max-w-7xl h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg md:text-xl text-slate-900">Appeals Management</h1>
                <p className="text-sm text-slate-500">Manage denied authorizations and generate appeal documentation</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {pendingCount} Pending
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  {inProgressCount} In Progress
                </Badge>
              </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start bg-white border">
                <TabsTrigger value="queue" className="text-xs sm:text-sm">
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Denied Cases
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="text-xs sm:text-sm">
                  <Clock className="h-4 w-4 mr-1.5" />
                  Appeals In Progress
                </TabsTrigger>
                <TabsTrigger value="resolved" className="text-xs sm:text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Resolved
                </TabsTrigger>
              </TabsList>

              <TabsContent value="queue" className="flex-1 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                  {/* Cases List */}
                  <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Denied Cases Awaiting Appeal</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-[400px] lg:h-full">
                        <div className="p-4 space-y-3">
                          {deniedCases.filter(c => c.status === "pending_appeal").map((caseItem) => (
                            <div
                              key={caseItem.id}
                              className={cn(
                                "p-3 rounded-lg border cursor-pointer transition-all",
                                selectedCase?.id === caseItem.id
                                  ? "border-red-300 bg-red-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              )}
                              onClick={() => setSelectedCase(caseItem)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-slate-900">{caseItem.patientName}</p>
                                  <p className="text-xs text-slate-500">{caseItem.paNumber}</p>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">
                                  {caseItem.daysRemaining}d left
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">{caseItem.diagnosis}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px]">{caseItem.payer}</Badge>
                                <span className="text-[10px] text-slate-400">Denied: {caseItem.deniedAt}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Case Detail & Appeal Builder */}
                  <Card className="lg:col-span-2 flex flex-col">
                    {selectedCase ? (
                      <>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{selectedCase.patientName}</CardTitle>
                              <CardDescription>{selectedCase.paNumber} | {selectedCase.diagnosis}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setP2PDialogOpen(true)}>
                                <Phone className="h-3.5 w-3.5 mr-1.5" />
                                Request P2P
                              </Button>
                              <Button size="sm" onClick={() => setLetterDialogOpen(true)}>
                                <FileText className="h-3.5 w-3.5 mr-1.5" />
                                Generate Appeal
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto space-y-4">
                          {/* Denial Info */}
                          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-xs text-red-900">Denial Reason</span>
                              <Badge variant="outline" className="text-[10px] ml-auto">{selectedCase.denialCode}</Badge>
                            </div>
                            <p className="text-sm text-red-800">{selectedCase.denialReason}</p>
                          </div>

                          {/* Appeal Deadline */}
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-600" />
                                <span className="text-xs text-amber-900">Appeal Deadline</span>
                              </div>
                              <span className="text-xs text-amber-700">{selectedCase.appealDeadline}</span>
                            </div>
                            <Progress value={(30 - selectedCase.daysRemaining) / 30 * 100} className="h-2" />
                            <p className="text-xs text-amber-700 mt-1">{selectedCase.daysRemaining} days remaining to file appeal</p>
                          </div>

                          {/* AI Strategy */}
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-900">AI-Suggested Strategy</span>
                              <Badge variant="outline" className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 ml-auto">
                                {selectedCase.similarCaseSuccessRate}% success rate
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-800">{selectedCase.aiSuggestedStrategy}</p>
                          </div>

                          {/* Literature Support */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4 text-slate-500" />
                              <span className="text-xs text-slate-700">Supporting Literature</span>
                            </div>
                            <div className="space-y-2">
                              {literatureReferences.map((ref) => (
                                <div key={ref.id} className="p-2 bg-white rounded border border-slate-200 flex items-start justify-between">
                                  <div>
                                    <p className="text-xs text-slate-800">{ref.title}</p>
                                    <p className="text-[10px] text-slate-500">{ref.citation}</p>
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-[10px]",
                                      ref.relevance === "Critical" && "bg-red-50 text-red-700 border-red-200",
                                      ref.relevance === "High" && "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    )}
                                  >
                                    {ref.relevance}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="pt-2 grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <Plus className="h-3.5 w-3.5 mr-1.5" />
                              Add Evidence
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              View Full Record
                            </Button>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <XCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Select a denied case to view details and start the appeal process</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="in-progress" className="flex-1 mt-4">
                <div className="grid gap-4">
                  {deniedCases.filter(c => c.status === "appeal_in_progress" || c.status === "p2p_scheduled").map((caseItem) => (
                    <Card key={caseItem.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {caseItem.status === "p2p_scheduled" ? (
                                <Phone className="h-5 w-5 text-blue-500" />
                              ) : (
                                <Clock className="h-5 w-5 text-amber-500" />
                              )}
                              {caseItem.paNumber} - {caseItem.patientName}
                            </CardTitle>
                            <CardDescription>{caseItem.diagnosis} | {caseItem.payer}</CardDescription>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              caseItem.status === "p2p_scheduled" 
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            {caseItem.status === "p2p_scheduled" ? "P2P Scheduled" : "Under Review"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {caseItem.p2pScheduled && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="text-xs text-blue-900">P2P Scheduled: {caseItem.p2pScheduled}</span>
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-slate-600">{caseItem.denialReason}</p>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline">View Appeal Letter</Button>
                          <Button size="sm" variant="outline">Add Documentation</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resolved" className="flex-1 mt-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          PA-2026-44123 - James Wilson
                        </CardTitle>
                        <CardDescription>Cardiac Catheterization | Aetna</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Approved on Appeal
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      Appeal successful after peer-to-peer review. Authorization approved with additional clinical documentation supporting medical necessity.
                    </p>
                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs text-emerald-800">
                        <strong>Resolution:</strong> P2P completed on Jan 20, 2026. Payer agreed documentation met criteria after review of updated functional assessment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Generate Appeal Letter Dialog */}
      <Dialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Generate Appeal Letter</DialogTitle>
            <DialogDescription>
              AI-powered appeal letter generation with supporting evidence and literature
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-4 py-4">
            {!generatedLetter ? (
              <>
                <div>
                  <label className="text-xs text-slate-700">Select Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose appeal type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {letterTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <p className="text-sm">{template.name}</p>
                            <p className="text-xs text-slate-500">{template.description}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-700">Additional Context (Optional)</label>
                  <Textarea 
                    placeholder="Add any specific points you want emphasized in the appeal..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={handleGenerateLetter} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Appeal Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Appeal Letter
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 rounded-lg border max-h-[400px] overflow-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-slate-700">{generatedLetter}</pre>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => navigator.clipboard.writeText(generatedLetter)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Letter
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setLetterDialogOpen(false); setGeneratedLetter(""); }}>
              Cancel
            </Button>
            {generatedLetter && (
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Submit Appeal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule P2P Dialog */}
      <Dialog open={p2pDialogOpen} onOpenChange={setP2PDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Peer-to-Peer Review</DialogTitle>
            <DialogDescription>
              Schedule a P2P call with the payer&apos;s medical director to discuss this case
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-slate-700">Preferred Date</label>
              <Input type="date" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-700">Preferred Time</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select time slot..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9am">9:00 AM - 10:00 AM</SelectItem>
                  <SelectItem value="10am">10:00 AM - 11:00 AM</SelectItem>
                  <SelectItem value="1pm">1:00 PM - 2:00 PM</SelectItem>
                  <SelectItem value="2pm">2:00 PM - 3:00 PM</SelectItem>
                  <SelectItem value="3pm">3:00 PM - 4:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-700">Attending Physician</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select physician..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chen">Dr. Robert Chen</SelectItem>
                  <SelectItem value="park">Dr. Lisa Park</SelectItem>
                  <SelectItem value="wilson">Dr. James Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-700">Key Discussion Points</label>
              <Textarea 
                placeholder="What specific points need to be discussed during the P2P?"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setP2PDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setP2PDialogOpen(false)}>
              <Calendar className="h-4 w-4 mr-2" />
              Request P2P
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
