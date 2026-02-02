"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
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
  FileText,
  Send,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
  Phone,
  Calendar,
  ArrowRight,
  Sparkles,
  History,
  ExternalLink,
  Copy,
  Printer,
  MessageSquare,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock submitted PAs with tracking
const submittedPAs = [
  {
    id: "pa-1",
    paNumber: "PA-2026-78432",
    patientName: "Sarah Johnson",
    mrn: "MRN-892451",
    procedure: "Inpatient Admission - Heart Failure",
    payer: "Medicare Advantage",
    submittedAt: "Jan 22, 2026 10:30 AM",
    status: "pending",
    estimatedDecision: "Jan 25, 2026",
    urgency: "STAT",
    trackingUpdates: [
      { timestamp: "Jan 22, 2026 10:30 AM", event: "PA Request Submitted", status: "complete" },
      { timestamp: "Jan 22, 2026 10:32 AM", event: "Received by Payer Portal", status: "complete" },
      { timestamp: "Jan 22, 2026 11:15 AM", event: "Assigned to Reviewer", status: "complete" },
      { timestamp: "Jan 22, 2026 2:00 PM", event: "Clinical Review In Progress", status: "current" },
      { timestamp: "Est. Jan 25, 2026", event: "Decision Expected", status: "pending" },
    ],
    aiPrediction: { approval: 82, confidence: "High" },
  },
  {
    id: "pa-2",
    paNumber: "PA-2026-78401",
    patientName: "James Wilson",
    mrn: "MRN-445821",
    procedure: "Cardiac Catheterization",
    payer: "Aetna",
    submittedAt: "Jan 21, 2026 3:45 PM",
    status: "approved",
    approvedAt: "Jan 22, 2026 9:00 AM",
    authNumber: "AUTH-2026-445821-CC",
    validUntil: "Apr 22, 2026",
    urgency: "URGENT",
    trackingUpdates: [
      { timestamp: "Jan 21, 2026 3:45 PM", event: "PA Request Submitted", status: "complete" },
      { timestamp: "Jan 21, 2026 3:47 PM", event: "Received by Payer Portal", status: "complete" },
      { timestamp: "Jan 21, 2026 4:30 PM", event: "Assigned to Reviewer", status: "complete" },
      { timestamp: "Jan 22, 2026 8:30 AM", event: "Clinical Review Complete", status: "complete" },
      { timestamp: "Jan 22, 2026 9:00 AM", event: "APPROVED", status: "approved" },
    ],
    aiPrediction: { approval: 91, confidence: "High" },
  },
  {
    id: "pa-3",
    paNumber: "PA-2026-78356",
    patientName: "Maria Garcia",
    mrn: "MRN-331298",
    procedure: "Extended SNF Stay",
    payer: "UnitedHealth",
    submittedAt: "Jan 20, 2026 11:00 AM",
    status: "info_requested",
    infoRequestedAt: "Jan 21, 2026 2:00 PM",
    infoDeadline: "Jan 24, 2026",
    requestedInfo: "Additional documentation required: Detailed discharge planning assessment and functional status scores.",
    urgency: "ROUTINE",
    trackingUpdates: [
      { timestamp: "Jan 20, 2026 11:00 AM", event: "PA Request Submitted", status: "complete" },
      { timestamp: "Jan 20, 2026 11:02 AM", event: "Received by Payer Portal", status: "complete" },
      { timestamp: "Jan 20, 2026 1:00 PM", event: "Assigned to Reviewer", status: "complete" },
      { timestamp: "Jan 21, 2026 2:00 PM", event: "Additional Information Requested", status: "action_required" },
      { timestamp: "Due Jan 24, 2026", event: "Information Submission Deadline", status: "pending" },
    ],
    aiPrediction: { approval: 68, confidence: "Medium" },
  },
  {
    id: "pa-4",
    paNumber: "PA-2026-78290",
    patientName: "Robert Martinez",
    mrn: "MRN-889012",
    procedure: "Lumbar Spinal Fusion",
    payer: "Humana",
    submittedAt: "Jan 18, 2026 9:00 AM",
    status: "denied",
    deniedAt: "Jan 20, 2026 4:30 PM",
    denialReason: "Insufficient documentation of failed conservative treatment (6+ months required).",
    denialCode: "MED-NEC-001",
    urgency: "ROUTINE",
    trackingUpdates: [
      { timestamp: "Jan 18, 2026 9:00 AM", event: "PA Request Submitted", status: "complete" },
      { timestamp: "Jan 18, 2026 9:02 AM", event: "Received by Payer Portal", status: "complete" },
      { timestamp: "Jan 18, 2026 11:00 AM", event: "Assigned to Reviewer", status: "complete" },
      { timestamp: "Jan 19, 2026 3:00 PM", event: "Clinical Review Complete", status: "complete" },
      { timestamp: "Jan 20, 2026 4:30 PM", event: "DENIED - Appeal Available", status: "denied" },
    ],
    aiPrediction: { approval: 45, confidence: "Medium" },
  },
]

// Status configuration
const statusConfig = {
  pending: { label: "Pending Review", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
  approved: { label: "Approved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
  denied: { label: "Denied", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
  info_requested: { label: "Info Requested", color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle },
}

export default function PriorAuthPage() {
  const [activeTab, setActiveTab] = useState("tracking")
  const [selectedPA, setSelectedPA] = useState<typeof submittedPAs[0] | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitPA = async () => {
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSubmitting(false)
    setSubmitDialogOpen(false)
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  const pendingCount = submittedPAs.filter(p => p.status === "pending" || p.status === "info_requested").length
  const approvedCount = submittedPAs.filter(p => p.status === "approved").length
  const deniedCount = submittedPAs.filter(p => p.status === "denied").length

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <AppHeader />
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 md:p-6">
          <div className="mx-auto max-w-7xl h-full flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Prior Authorization</h1>
                <p className="text-sm text-slate-500">Compose, submit, and track authorization requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {pendingCount} Pending
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {approvedCount} Approved
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {deniedCount} Denied
                </Badge>
              </div>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start bg-white border">
                <TabsTrigger value="tracking" className="text-xs sm:text-sm">
                  <History className="h-4 w-4 mr-1.5" />
                  Submission Tracking
                </TabsTrigger>
                <TabsTrigger value="compose" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1.5" />
                  Compose New PA
                </TabsTrigger>
              </TabsList>

              {/* Tracking Tab */}
              <TabsContent value="tracking" className="flex-1 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                  {/* Submissions List */}
                  <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Recent Submissions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                      <ScrollArea className="h-[400px] lg:h-full">
                        <div className="p-4 space-y-3">
                          {submittedPAs.map((pa) => {
                            const statusInfo = getStatusInfo(pa.status)
                            const StatusIcon = statusInfo.icon
                            return (
                              <div
                                key={pa.id}
                                className={cn(
                                  "p-3 rounded-lg border cursor-pointer transition-all",
                                  selectedPA?.id === pa.id
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                )}
                                onClick={() => setSelectedPA(pa)}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-sm text-slate-900">{pa.patientName}</p>
                                    <p className="text-xs text-slate-500">{pa.paNumber}</p>
                                  </div>
                                  <Badge variant="outline" className={cn("text-[10px]", statusInfo.color)}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{pa.procedure}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <Badge variant="outline" className="text-[10px]">{pa.payer}</Badge>
                                  <span className="text-[10px] text-slate-400">{pa.submittedAt.split(" ")[0]}</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Tracking Detail */}
                  <Card className="lg:col-span-2 flex flex-col">
                    {selectedPA ? (
                      <>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{selectedPA.paNumber}</CardTitle>
                              <CardDescription>{selectedPA.patientName} | {selectedPA.procedure}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {selectedPA.status === "info_requested" && (
                                <Button size="sm">
                                  <Send className="h-3.5 w-3.5 mr-1.5" />
                                  Submit Info
                                </Button>
                              )}
                              {selectedPA.status === "denied" && (
                                <Button size="sm" variant="outline">
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                  File Appeal
                                </Button>
                              )}
                              <Button size="sm" variant="outline">
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View Request
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto space-y-4">
                          {/* Status Banner */}
                          {selectedPA.status === "approved" && (
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                <span className="font-semibold text-emerald-900">Authorization Approved</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-emerald-700">Auth Number</p>
                                  <p className="font-medium text-emerald-900">{selectedPA.authNumber}</p>
                                </div>
                                <div>
                                  <p className="text-emerald-700">Valid Until</p>
                                  <p className="font-medium text-emerald-900">{selectedPA.validUntil}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline" className="text-xs bg-white">
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy Auth #
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs bg-white">
                                  <Printer className="h-3 w-3 mr-1" />
                                  Print
                                </Button>
                              </div>
                            </div>
                          )}

                          {selectedPA.status === "denied" && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center gap-2 mb-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="font-semibold text-red-900">Authorization Denied</span>
                              </div>
                              <p className="text-sm text-red-800 mb-2">{selectedPA.denialReason}</p>
                              <Badge variant="outline" className="text-[10px] bg-red-100 text-red-700 border-red-200">
                                Code: {selectedPA.denialCode}
                              </Badge>
                            </div>
                          )}

                          {selectedPA.status === "info_requested" && (
                            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                <span className="font-semibold text-amber-900">Additional Information Required</span>
                              </div>
                              <p className="text-sm text-amber-800 mb-2">{selectedPA.requestedInfo}</p>
                              <div className="flex items-center gap-2 text-xs text-amber-700">
                                <Clock className="h-3 w-3" />
                                Deadline: {selectedPA.infoDeadline}
                              </div>
                            </div>
                          )}

                          {/* AI Prediction */}
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">AI Approval Prediction</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] bg-purple-100 text-purple-700 border-purple-200">
                                {selectedPA.aiPrediction.confidence} Confidence
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={selectedPA.aiPrediction.approval} className="h-2 flex-1" />
                              <span className="text-sm font-semibold text-purple-700">{selectedPA.aiPrediction.approval}%</span>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div>
                            <p className="text-sm font-medium text-slate-700 mb-3">Submission Timeline</p>
                            <div className="space-y-0">
                              {selectedPA.trackingUpdates.map((update, index) => (
                                <div key={index} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={cn(
                                      "h-3 w-3 rounded-full border-2",
                                      update.status === "complete" && "bg-emerald-500 border-emerald-500",
                                      update.status === "current" && "bg-blue-500 border-blue-500 animate-pulse",
                                      update.status === "approved" && "bg-emerald-500 border-emerald-500",
                                      update.status === "denied" && "bg-red-500 border-red-500",
                                      update.status === "action_required" && "bg-amber-500 border-amber-500",
                                      update.status === "pending" && "bg-white border-slate-300"
                                    )} />
                                    {index < selectedPA.trackingUpdates.length - 1 && (
                                      <div className={cn(
                                        "w-0.5 h-8 my-1",
                                        update.status === "complete" || update.status === "approved" || update.status === "denied" || update.status === "action_required"
                                          ? "bg-slate-300"
                                          : "bg-slate-200 border-l border-dashed border-slate-300"
                                      )} />
                                    )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <p className={cn(
                                      "text-sm font-medium",
                                      update.status === "approved" && "text-emerald-700",
                                      update.status === "denied" && "text-red-700",
                                      update.status === "action_required" && "text-amber-700",
                                      update.status === "current" && "text-blue-700",
                                      (update.status === "complete" || update.status === "pending") && "text-slate-700"
                                    )}>
                                      {update.event}
                                    </p>
                                    <p className="text-xs text-slate-500">{update.timestamp}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <Phone className="h-3.5 w-3.5 mr-1.5" />
                              Call Payer
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                              Send Message
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs bg-transparent">
                              <Bell className="h-3.5 w-3.5 mr-1.5" />
                              Set Alert
                            </Button>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Select a submission to view tracking details</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </TabsContent>

              {/* Compose Tab */}
              <TabsContent value="compose" className="flex-1 mt-4">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          AI-Generated Authorization Request
                        </CardTitle>
                        <CardDescription>Review and customize before submission</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-1.5" />
                          Save Draft
                        </Button>
                        <Button size="sm" onClick={() => setSubmitDialogOpen(true)}>
                          <Send className="h-4 w-4 mr-1.5" />
                          Submit PA
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-auto">
                    <div className="max-w-3xl space-y-6">
                      {/* Patient Info */}
                      <div className="p-4 bg-slate-50 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-slate-900">Sarah Johnson</h3>
                            <p className="text-sm text-slate-500">DOB: 03/15/1958 | MRN: MRN-892451</p>
                            <p className="text-sm text-slate-500">Medicare Advantage</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">Auto-Generated</Badge>
                        </div>
                      </div>

                      {/* Procedure */}
                      <div>
                        <label className="text-sm font-medium text-slate-700">Requested Service</label>
                        <div className="mt-1 p-3 bg-white rounded-lg border">
                          <p className="font-medium text-slate-900">Inpatient Admission - Acute Heart Failure</p>
                          <p className="text-sm text-slate-500">ICD-10: I50.31 | DRG: 291</p>
                        </div>
                      </div>

                      {/* Clinical Justification */}
                      <div>
                        <label className="text-sm font-medium text-slate-700">Clinical Justification</label>
                        <Textarea
                          className="mt-1 min-h-[200px]"
                          defaultValue={`Patient is a 67-year-old female admitted with acute decompensated heart failure requiring inpatient level of care.

CLINICAL PRESENTATION:
- Acute onset shortness of breath and chest pain worsening over 24 hours
- Vital signs on presentation: BP 160/95, HR 105, RR 24, O2 88% on room air
- Physical exam: Bilateral crackles, JVD, 2+ lower extremity edema

DIAGNOSTIC FINDINGS:
- Chest X-ray: Bilateral pulmonary edema, cardiomegaly
- BNP: 1,240 pg/mL (significantly elevated)
- Echocardiogram: EF 30-35%, moderate LV dysfunction
- Troponin: Mildly elevated, trending down

TREATMENT RESPONSE:
- Started on IV diuretics with good response
- Fluid balance -1.2L in first 24 hours
- Oxygen requirements decreasing from 4L to 2L NC

MEDICAL NECESSITY:
Inpatient admission is medically necessary due to:
1. Need for IV diuretic therapy and continuous cardiac monitoring
2. Requirement for serial laboratory monitoring
3. Hemodynamic instability requiring close observation
4. Need for specialist consultations (cardiology, pulmonology)`}
                        />
                      </div>

                      {/* Supporting Documentation */}
                      <div>
                        <label className="text-sm font-medium text-slate-700">Attached Evidence</label>
                        <div className="mt-1 space-y-2">
                          {[
                            { name: "Admission H&P", type: "Progress Note" },
                            { name: "Chest X-Ray Report", type: "Imaging" },
                            { name: "Echocardiogram Results", type: "Diagnostic" },
                            { name: "Laboratory Panel", type: "Lab Results" },
                          ].map((doc, i) => (
                            <div key={i} className="p-2 bg-white rounded border flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span className="text-sm text-slate-700">{doc.name}</span>
                                <Badge variant="outline" className="text-[10px]">{doc.type}</Badge>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" className="w-full text-xs bg-transparent">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            Add More Evidence
                          </Button>
                        </div>
                      </div>

                      {/* AI Confidence */}
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-purple-900">AI Analysis</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-purple-700">92%</p>
                            <p className="text-xs text-purple-600">Confidence</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-emerald-700">High</p>
                            <p className="text-xs text-emerald-600">Approval Likelihood</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-700">4/4</p>
                            <p className="text-xs text-blue-600">Payer Rules Met</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Prior Authorization</DialogTitle>
            <DialogDescription>
              This will submit the PA request to Medicare Advantage for review.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Patient</span>
                <span className="text-sm font-medium">Sarah Johnson</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-slate-600">Service</span>
                <span className="text-sm font-medium">Inpatient Admission</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-slate-600">Payer</span>
                <span className="text-sm font-medium">Medicare Advantage</span>
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-800">AI predicts <strong>92%</strong> approval likelihood</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPA} disabled={submitting}>
              {submitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit PA Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
