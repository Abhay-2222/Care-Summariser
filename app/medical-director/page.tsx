"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  FileText,
  Stethoscope,
  ChevronRight,
  Brain,
  Shield,
  Scale,
  MessageSquare,
  Phone,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock escalated cases
const escalatedCases = [
  {
    id: "esc-1",
    patientName: "Sarah Johnson",
    mrn: "MRN-892451",
    age: 67,
    gender: "F",
    diagnosis: "Acute Decompensated Heart Failure",
    urgency: "STAT",
    escalatedBy: "Dr. Robert Chen",
    escalatedAt: "2 hours ago",
    reason: "Complex comorbidities - uncertain about medical necessity for extended ICU stay",
    careLensRisk: "High",
    rulesMetCount: 2,
    rulesTotalCount: 5,
    recommendedAction: "Approve with conditions",
    aiAnalysis: "Patient has multiple high-risk factors including age >65, EF <35%, and recurrent admissions. Historical data suggests 89% approval rate for similar cases when cardiology consult is documented.",
  },
  {
    id: "esc-2",
    patientName: "James Wilson",
    mrn: "MRN-445821",
    age: 45,
    gender: "M",
    diagnosis: "Elective Cardiac Catheterization",
    urgency: "URGENT",
    escalatedBy: "Dr. Lisa Park",
    escalatedAt: "4 hours ago",
    reason: "Borderline indications - patient asymptomatic but stress test positive",
    careLensRisk: "Medium",
    rulesMetCount: 3,
    rulesTotalCount: 4,
    recommendedAction: "Request additional documentation",
    aiAnalysis: "Asymptomatic patients with positive stress tests have 62% approval rate. Adding documentation of functional limitations would increase to 91%.",
  },
  {
    id: "esc-3",
    patientName: "Maria Garcia",
    mrn: "MRN-331298",
    age: 72,
    gender: "F",
    diagnosis: "Bilateral Knee Replacement",
    urgency: "ROUTINE",
    escalatedBy: "Dr. Robert Chen",
    escalatedAt: "1 day ago",
    reason: "Payer policy conflict - prior failed conservative treatment not documented in current system",
    careLensRisk: "Medium",
    rulesMetCount: 2,
    rulesTotalCount: 5,
    recommendedAction: "Request historical records",
    aiAnalysis: "Missing 6-month conservative treatment documentation. Patient reports PT at outside facility. Recommend requesting records before decision.",
  },
]

// Mock P2P scheduled calls
const p2pScheduled = [
  {
    id: "p2p-1",
    patientName: "Robert Martinez",
    payer: "Aetna",
    scheduledTime: "Today, 3:00 PM",
    reviewerName: "Dr. Karen White",
    reviewerRole: "Aetna Medical Director",
    topic: "Extended SNF stay for post-stroke rehabilitation",
    prepNotes: "Patient shows significant progress but needs additional 14 days. Have FIM scores ready.",
  },
  {
    id: "p2p-2",
    patientName: "Linda Thompson",
    payer: "UnitedHealth",
    scheduledTime: "Tomorrow, 10:30 AM",
    reviewerName: "Dr. James Liu",
    reviewerRole: "UHC Medical Reviewer",
    topic: "Experimental treatment protocol for refractory epilepsy",
    prepNotes: "Review literature supporting VNS for drug-resistant cases. Have seizure frequency logs.",
  },
]

// Mock metrics
const metrics = {
  pendingEscalations: 3,
  p2pToday: 2,
  avgDecisionTime: "2.4 hrs",
  approvalRate: "78%",
  overturnedDenials: 12,
}

export default function MedicalDirectorPage() {
  const [selectedCase, setSelectedCase] = useState<typeof escalatedCases[0] | null>(null)
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false)
  const [decisionNotes, setDecisionNotes] = useState("")
  const [selectedDecision, setSelectedDecision] = useState<"approve" | "deny" | "p2p" | null>(null)

  const handleMakeDecision = (decision: "approve" | "deny" | "p2p") => {
    setSelectedDecision(decision)
    setDecisionDialogOpen(true)
  }

  const handleConfirmDecision = () => {
    // In real app, would save decision
    setDecisionDialogOpen(false)
    setSelectedCase(null)
    setDecisionNotes("")
    setSelectedDecision(null)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <AppHeader />
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 md:p-6">
          <div className="mx-auto max-w-7xl h-full flex flex-col gap-4 md:gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-heading-lg text-foreground">Medical Director Dashboard</h1>
                <p className="text-body-md text-[var(--neutral-500)]">Review escalated cases and manage peer-to-peer reviews</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[var(--status-ok-bg)] text-[var(--status-ok-text)] border-[var(--status-ok-border)]">
                  <Shield className="h-3 w-3 mr-1" />
                  Medical Director View
                </Badge>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              <Card className="bg-card">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--status-error-bg)] flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-[var(--destructive)]" />
                    </div>
                    <div>
                      <p className="text-caption text-[var(--neutral-500)]">Pending Escalations</p>
                      <p className="text-heading-lg text-foreground">{metrics.pendingEscalations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
                      <Phone className="h-4 w-4 text-[var(--brand-500)]" />
                    </div>
                    <div>
                      <p className="text-caption text-[var(--neutral-500)]">P2P Today</p>
                      <p className="text-heading-lg text-foreground">{metrics.p2pToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--status-ok-bg)] flex items-center justify-center">
                      <Clock className="h-4 w-4 text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="text-caption text-[var(--neutral-500)]">Avg Decision</p>
                      <p className="text-heading-lg text-foreground">{metrics.avgDecisionTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[var(--status-ok-bg)] flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="text-caption text-[var(--neutral-500)]">Approval Rate</p>
                      <p className="text-heading-lg text-foreground">{metrics.approvalRate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card col-span-2 md:col-span-1">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--status-warn-bg)] flex items-center justify-center">
                      <Scale className="h-4 w-4 text-[var(--warning)]" />
                    </div>
                    <div>
                      <p className="text-caption text-[var(--neutral-500)]">Overturned</p>
                      <p className="text-heading-lg text-foreground">{metrics.overturnedDenials}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 min-h-0">
              {/* Escalated Cases List */}
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
                    Escalated Cases
                  </CardTitle>
                  <CardDescription>Cases requiring Medical Director review</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-[300px] lg:h-full">
                    <div className="p-4 space-y-3">
                      {escalatedCases.map((caseItem) => (
                        <div
                          key={caseItem.id}
                          className={cn(
                            "p-3 md:p-4 rounded-lg border cursor-pointer transition-all",
                            selectedCase?.id === caseItem.id
                              ? "border-[var(--brand-300)] bg-[var(--brand-50)]"
                              : "border-border bg-card hover:border-[var(--neutral-300)]"
                          )}
                          onClick={() => setSelectedCase(caseItem)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-foreground text-body-md">{caseItem.patientName}</span>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-ds-badge",
                                    caseItem.urgency === "STAT" && "bg-[var(--status-error-bg)] text-[var(--status-error-text)] border-[var(--status-error-border)]",
                                    caseItem.urgency === "URGENT" && "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border-[var(--status-warn-border)]",
                                    caseItem.urgency === "ROUTINE" && "bg-[var(--neutral-50)] text-[var(--neutral-600)] border-[var(--neutral-200)]"
                                  )}
                                >
                                  {caseItem.urgency}
                                </Badge>
                              </div>
                              <p className="text-body-sm text-[var(--neutral-500)] mt-0.5">{caseItem.age}yo {caseItem.gender} | {caseItem.mrn}</p>
                              <p className="text-body-sm text-foreground mt-1 line-clamp-1">{caseItem.diagnosis}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-[var(--neutral-400)] flex-shrink-0" />
                          </div>
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="flex items-center gap-2 text-caption text-[var(--neutral-500)]">
                              <Stethoscope className="h-3 w-3" />
                              <span>Escalated by {caseItem.escalatedBy} - {caseItem.escalatedAt}</span>
                            </div>
                            <p className="text-body-sm text-[var(--neutral-600)] mt-1 line-clamp-2">{caseItem.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Right Panel - Case Detail or P2P Schedule */}
              <div className="flex flex-col gap-4">
                {selectedCase ? (
                  /* Case Detail Panel */
                  <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Case Review</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto space-y-4">
                      {/* Patient Info */}
                      <div className="p-3 bg-[var(--neutral-50)] rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-[var(--brand-50)] text-[var(--brand-700)] text-body-md">
                              {selectedCase.patientName.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-body-md text-foreground">{selectedCase.patientName}</p>
                            <p className="text-body-sm text-[var(--neutral-500)]">{selectedCase.age}yo {selectedCase.gender} | {selectedCase.mrn}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-label-md text-foreground">{selectedCase.diagnosis}</p>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      <div className="p-3 bg-[var(--status-info-bg)] rounded-xl border border-[var(--status-info-border)]">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-[var(--brand-500)]" />
                          <span className="text-label-md text-[var(--status-info-text)]">CareLens Analysis</span>
                        </div>
                        <p className="text-body-sm text-[var(--status-info-text)]">{selectedCase.aiAnalysis}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <Badge variant="outline" className={cn(
                            "text-ds-badge",
                            selectedCase.careLensRisk === "High" && "bg-[var(--status-error-bg)] text-[var(--status-error-text)] border-[var(--status-error-border)]",
                            selectedCase.careLensRisk === "Medium" && "bg-[var(--status-warn-bg)] text-[var(--status-warn-text)] border-[var(--status-warn-border)]"
                          )}>
                            {selectedCase.careLensRisk} Risk
                          </Badge>
                          <span className="text-caption text-[var(--neutral-500)]">
                            Rules: {selectedCase.rulesMetCount}/{selectedCase.rulesTotalCount}
                          </span>
                        </div>
                      </div>

                      {/* Escalation Reason */}
                      <div>
                        <p className="text-label-md text-foreground mb-1">Escalation Reason</p>
                        <p className="text-body-sm text-[var(--neutral-600)]">{selectedCase.reason}</p>
                      </div>

                      {/* Recommended Action */}
                      <div className="p-3 bg-[var(--status-info-bg)] rounded-xl border border-[var(--status-info-border)]">
                        <p className="text-label-md text-[var(--status-info-text)] mb-1">Recommended Action</p>
                        <p className="text-body-sm text-[var(--status-info-text)]">{selectedCase.recommendedAction}</p>
                      </div>

                      {/* Decision Buttons */}
                      <div className="pt-2 space-y-2">
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleMakeDecision("approve")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve for PA
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                            onClick={() => handleMakeDecision("p2p")}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Schedule P2P
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                            onClick={() => handleMakeDecision("deny")}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* P2P Schedule */
                  <Card className="flex-1 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-500" />
                        Peer-to-Peer Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                      <div className="space-y-3">
                        {p2pScheduled.map((p2p) => (
                          <div key={p2p.id} className="p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm text-slate-900">{p2p.patientName}</span>
                              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                                {p2p.payer}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                              <Calendar className="h-3 w-3" />
                              <span>{p2p.scheduledTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                              <Users className="h-3 w-3" />
                              <span>{p2p.reviewerName} ({p2p.reviewerRole})</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mb-2">{p2p.topic}</p>
                            <div className="p-2 bg-amber-50 rounded text-[10px] text-amber-800">
                              <strong>Prep:</strong> {p2p.prepNotes}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button size="sm" variant="outline" className="text-xs h-7 flex-1 bg-transparent">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Notes
                              </Button>
                              <Button size="sm" className="text-xs h-7 flex-1 bg-blue-600 hover:bg-blue-700">
                                <Phone className="h-3 w-3 mr-1" />
                                Join Call
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Confirmation Dialog */}
      <Dialog open={decisionDialogOpen} onOpenChange={setDecisionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDecision === "approve" && "Approve Case for PA Submission"}
              {selectedDecision === "deny" && "Deny Authorization Request"}
              {selectedDecision === "p2p" && "Schedule Peer-to-Peer Review"}
            </DialogTitle>
            <DialogDescription>
              {selectedDecision === "approve" && "This case will be marked as approved and returned to the case manager for PA submission."}
              {selectedDecision === "deny" && "Please provide the clinical rationale for denial. This will be documented for compliance and potential appeals."}
              {selectedDecision === "p2p" && "A peer-to-peer review will be scheduled with the payer's medical director."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-slate-700">Decision Notes</label>
            <Textarea
              placeholder={
                selectedDecision === "approve" 
                  ? "Optional: Add any conditions or notes for the case manager..."
                  : selectedDecision === "deny"
                  ? "Required: Clinical rationale for denial..."
                  : "Optional: Topics to discuss during P2P..."
              }
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDecision}
              className={cn(
                selectedDecision === "approve" && "bg-emerald-600 hover:bg-emerald-700",
                selectedDecision === "deny" && "bg-red-600 hover:bg-red-700",
                selectedDecision === "p2p" && "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {selectedDecision === "approve" && "Confirm Approval"}
              {selectedDecision === "deny" && "Confirm Denial"}
              {selectedDecision === "p2p" && "Schedule P2P"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
